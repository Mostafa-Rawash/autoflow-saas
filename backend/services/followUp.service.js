const FollowUp = require('../models/FollowUp');
const FollowUpExecution = require('../models/FollowUpExecution');
const Template = require('../models/Template');
const Conversation = require('../models/Conversation');
const { resolveVariables } = require('./variableResolver.service');

class FollowUpService {
  constructor() {
    this.checkerInterval = null;
  }

  /**
   * Resolve follow-up content: use template or direct content, with variable substitution.
   */
  async resolveContent(followUp, conversation) {
    let text = '';

    if (followUp.templateId) {
      try {
        const template = await Template.findById(followUp.templateId);
        if (template) {
          text = template.content?.text || template.content || '';
        } else {
          // Template deleted or inactive — fall back to direct content
          text = followUp.content || '';
        }
      } catch {
        text = followUp.content || '';
      }
    } else {
      text = followUp.content || '';
    }

    if (conversation && text) {
      text = resolveVariables(text, conversation);
    }

    return text;
  }

  /**
   * Create a follow-up execution and queue the message for delivery.
   */
  async createExecution(followUp, conversation, scheduledFor) {
    const resolvedContent = await this.resolveContent(followUp, conversation);

    if (!resolvedContent) {
      console.warn(`[FollowUp] No content resolved for follow-up ${followUp._id}, skipping`);
      return null;
    }

    // Check if a pending execution already exists for this follow-up + conversation
    const existing = await FollowUpExecution.findOne({
      followUp: followUp._id,
      conversation: conversation._id,
      status: 'pending'
    });

    if (existing) {
      return existing; // Don't duplicate
    }

    const execution = await FollowUpExecution.create({
      user: followUp.user,
      followUp: followUp._id,
      conversation: conversation._id,
      status: 'pending',
      attemptNumber: 1,
      scheduledFor: scheduledFor || new Date(),
      resolvedContent
    });

    // Queue the message via MessageQueue
    try {
      const MessageQueue = require('../models/MessageQueue');
      const queueItem = await MessageQueue.create({
        user: followUp.user,
        conversation: conversation._id,
        content: resolvedContent,
        type: 'text',
        channel: conversation.channel,
        scheduledFor: execution.scheduledFor,
        priority: followUp.priority || 2,
        status: 'pending',
        metadata: {
          followUpId: followUp._id,
          followUpExecutionId: execution._id,
          autoReplyRule: followUp.name
        }
      });

      execution.queueItemId = queueItem._id;
      await execution.save();

      // Increment usage count
      followUp.usageCount = (followUp.usageCount || 0) + 1;
      await followUp.save();
    } catch (err) {
      console.error('[FollowUp] Error queuing message:', err.message);
      execution.status = 'failed';
      await execution.save();
    }

    return execution;
  }

  /**
   * Check for idle conversations and queue no-reply follow-ups.
   * Called periodically by startChecker().
   */
  async checkNoReplyFollowUps() {
    try {
      const rules = await FollowUp.find({
        triggerType: 'no_reply',
        isActive: true,
        delayMinutes: { $exists: true, $ne: null }
      });

      for (const rule of rules) {
        const cutoffTime = new Date(Date.now() - rule.delayMinutes * 60 * 1000);

        // Find conversations where the last message was from the contact (not agent)
        // and was sent more than delayMinutes ago
        const conversations = await Conversation.find({
          user: rule.user,
          status: { $in: ['active', 'pending'] },
          'lastMessage.timestamp': { $lte: cutoffTime },
          'lastMessage.sender': 'contact'
        });

        for (const conv of conversations) {
          // Check channel match
          if (rule.channels.length > 0 && !rule.channels.includes(conv.channel)) continue;

          // Check max attempts
          const executionCount = await FollowUpExecution.countDocuments({
            followUp: rule._id,
            conversation: conv._id,
            status: { $in: ['pending', 'sent'] }
          });

          if (executionCount >= rule.maxAttempts) continue;

          // Calculate scheduled time (now, since the delay has already elapsed)
          await this.createExecution(rule, conv, new Date());
        }
      }
    } catch (err) {
      console.error('[FollowUp] Error in no-reply check:', err.message);
    }
  }

  /**
   * Handle new conversation event — trigger new_conversation follow-ups.
   */
  async handleConversationCreated(conversation) {
    try {
      const rules = await FollowUp.find({
        user: conversation.user || conversation.userId,
        triggerType: 'new_conversation',
        isActive: true
      });

      for (const rule of rules) {
        // Check channel match
        if (rule.channel !== 'all' && rule.channel !== conversation.channel) continue;
        if (rule.channels.length > 0 && !rule.channels.includes(conversation.channel)) continue;

        await this.createExecution(rule, conversation, new Date());
      }
    } catch (err) {
      console.error('[FollowUp] Error handling new conversation:', err.message);
    }
  }

  /**
   * Handle conversation status change — trigger status_change follow-ups.
   */
  async handleStatusChange(conversation, oldStatus, newStatus) {
    try {
      const rules = await FollowUp.find({
        user: conversation.user || conversation.userId,
        triggerType: 'status_change',
        isActive: true
      });

      for (const rule of rules) {
        const fromMatch = !rule.fromStatus || rule.fromStatus === oldStatus;
        const toMatch = !rule.toStatus || rule.toStatus === newStatus;

        if (!fromMatch || !toMatch) continue;

        // Check channel match
        if (rule.channels.length > 0 && !rule.channels.includes(conversation.channel)) continue;

        await this.createExecution(rule, conversation, new Date());
      }
    } catch (err) {
      console.error('[FollowUp] Error handling status change:', err.message);
    }
  }

  /**
   * Handle contact reply — cancel pending no-reply follow-ups with stopOnReply.
   */
  async handleContactReply(userId, conversationId) {
    try {
      const pendingExecutions = await FollowUpExecution.find({
        user: userId,
        conversation: conversationId,
        status: 'pending'
      }).populate('followUp');

      for (const execution of pendingExecutions) {
        if (execution.followUp?.stopOnReply) {
          execution.status = 'cancelled';
          execution.contactRepliedBefore = true;
          await execution.save();

          // Also cancel the corresponding queue item
          if (execution.queueItemId) {
            try {
              const MessageQueue = require('../models/MessageQueue');
              await MessageQueue.updateOne(
                { _id: execution.queueItemId },
                { status: 'cancelled' }
              );
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error('[FollowUp] Error handling contact reply:', err.message);
    }
  }

  /**
   * Start the periodic checker for idle conversation follow-ups.
   * @param {number} intervalMs - Check interval in milliseconds (default 60000 = 1 minute)
   */
  startChecker(intervalMs = 60000) {
    if (this.checkerInterval) {
      clearInterval(this.checkerInterval);
    }

    // Run immediately on start
    this.checkNoReplyFollowUps();

    this.checkerInterval = setInterval(() => {
      this.checkNoReplyFollowUps();
    }, intervalMs);

    console.log(`[FollowUp] Checker started with ${intervalMs / 1000}s interval`);
  }

  /**
   * Stop the checker (useful for tests or graceful shutdown).
   */
  stopChecker() {
    if (this.checkerInterval) {
      clearInterval(this.checkerInterval);
      this.checkerInterval = null;
      console.log('[FollowUp] Checker stopped');
    }
  }
}

module.exports = new FollowUpService();