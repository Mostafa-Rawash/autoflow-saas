const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ragService = require('./rag.service');

/**
 * AI Auto-Responder Service
 * Handles automatic AI responses for channel messages when no auto-reply rule matches.
 * Priority: auto-reply rules > AI auto-response > no response
 */
class AIResponderService {

  /**
   * Check if AI auto-reply is enabled for a user and channel.
   */
  async isEnabled(userId, channel) {
    const user = await User.findById(userId).select('settings.aiAutoReply');
    if (!user || !user.settings?.aiAutoReply?.enabled) return false;

    const channels = user.settings.aiAutoReply.channels || ['whatsapp', 'telegram'];
    return channels.includes(channel);
  }

  /**
   * Check if user has exceeded their AI message limit.
   * Returns { allowed: boolean, usage: number, limit: number }
   */
  async checkLimit(userId) {
    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      return { allowed: false, usage: 0, limit: 0, reason: 'no_subscription' };
    }

    const usage = subscription.usage.aiMessages || 0;
    const limit = subscription.limits.aiMessages || 0;

    if (limit === Infinity || usage < limit) {
      return { allowed: true, usage, limit };
    }

    return { allowed: false, usage, limit, reason: 'limit_exceeded' };
  }

  /**
   * Handle an incoming channel message that didn't match any auto-reply rule.
   * Generates an AI response if enabled and within limits.
   * Returns null if AI should not respond.
   */
  async handleIncomingMessage(userId, text, conversation, channel) {
    try {
      // Step 1: Check if AI auto-reply is enabled for this channel
      const enabled = await this.isEnabled(userId, channel);
      if (!enabled) return null;

      // Step 2: Check if OpenAI is configured
      if (!process.env.OPENAI_API_KEY) {
        console.log(`[AIResponder] OPENAI_API_KEY not configured for user ${userId}`);
        return null;
      }

      // Step 3: Check plan limits
      const limitCheck = await this.checkLimit(userId);
      if (!limitCheck.allowed) {
        console.log(`[AIResponder] AI message limit exceeded for user ${userId} (${limitCheck.usage}/${limitCheck.limit})`);
        return null;
      }

      // Step 4: Get user settings for tone and sources
      const user = await User.findById(userId).select('settings.aiAutoReply');
      const tone = user?.settings?.aiAutoReply?.tone || 'professional';
      const includeSources = user?.settings?.aiAutoReply?.includeSources || false;

      // Step 5: Generate AI response via RAG
      const result = await ragService.generateAutoReply(userId, text, {
        tone,
        includeSources,
        topK: 3
      });

      if (!result || !result.answer) return null;

      // Step 6: Increment usage
      await Subscription.updateOne(
        { user: userId },
        { $inc: { 'usage.aiMessages': 1 } }
      );

      return {
        text: result.answer,
        sources: includeSources ? result.sources : [],
        model: result.model,
        tokensUsed: result.tokensUsed
      };
    } catch (err) {
      console.error('[AIResponder] Error:', err.message);
      return null;
    }
  }

  /**
   * Save the AI response as a message in the conversation.
   */
  async saveMessage(conversationId, userId, channel, aiResponse) {
    try {
      const message = await Message.create({
        conversation: conversationId,
        user: userId,
        sender: 'bot',
        content: aiResponse.text,
        type: 'text',
        metadata: {
          aiGenerated: true,
          aiModel: aiResponse.model,
          aiTokensUsed: aiResponse.tokensUsed,
          channel
        }
      });

      // Update conversation's lastMessage
      await Conversation.updateOne(
        { _id: conversationId },
        {
          lastMessage: {
            content: aiResponse.text.substring(0, 200),
            sender: 'bot',
            timestamp: new Date()
          },
          lastMessageAt: new Date()
        }
      );

      return message;
    } catch (err) {
      console.error('[AIResponder] Error saving message:', err.message);
      return null;
    }
  }
}

module.exports = new AIResponderService();