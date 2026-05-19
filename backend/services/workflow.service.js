const Workflow = require('../models/Workflow');

class WorkflowService {
  async getWorkflows(userId, params = {}) {
    const { page = 1, limit = 20, trigger } = params;
    const query = { user: userId };
    if (trigger) query['trigger.type'] = trigger;

    const skip = (page - 1) * limit;
    const [workflows, total] = await Promise.all([
      Workflow.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Workflow.countDocuments(query)
    ]);
    return { workflows, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async getWorkflow(userId, workflowId) {
    const workflow = await Workflow.findOne({ _id: workflowId, user: userId });
    if (!workflow) throw new Error('سير العمل غير موجود');
    return workflow;
  }

  async createWorkflow(userId, data) {
    return Workflow.create({ ...data, user: userId });
  }

  async updateWorkflow(userId, workflowId, data) {
    const workflow = await Workflow.findOneAndUpdate(
      { _id: workflowId, user: userId },
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!workflow) throw new Error('سير العمل غير موجود');
    return workflow;
  }

  async deleteWorkflow(userId, workflowId) {
    const workflow = await Workflow.findOneAndDelete({ _id: workflowId, user: userId });
    if (!workflow) throw new Error('سير العمل غير موجود');
    return workflow;
  }

  async toggleWorkflow(userId, workflowId) {
    const workflow = await Workflow.findOne({ _id: workflowId, user: userId });
    if (!workflow) throw new Error('سير العمل غير موجود');
    workflow.isActive = !workflow.isActive;
    await workflow.save();
    return workflow;
  }

  async evaluateTrigger(userId, triggerType, conversation, extraData = {}) {
    const workflows = await Workflow.find({
      user: userId,
      'trigger.type': triggerType,
      isActive: true
    });

    const results = [];
    for (const workflow of workflows) {
      const matched = this._matchConditions(workflow.trigger.conditions, conversation, extraData);
      if (matched) {
        const executionResults = await this._executeActions(workflow.actions, conversation, userId);
        workflow.executionCount += 1;
        workflow.lastExecutedAt = new Date();
        await workflow.save();
        results.push({ workflowId: workflow._id, name: workflow.name, actions: executionResults });
      }
    }
    return results;
  }

  _matchConditions(conditions, conversation, extraData) {
    if (!conditions || conditions.length === 0) return true;
    return conditions.every(cond => {
      const value = this._getFieldValue(cond.field, conversation, extraData);
      switch (cond.operator) {
        case 'equals': return value === cond.value;
        case 'not_equals': return value !== cond.value;
        case 'contains': return String(value).includes(cond.value);
        case 'not_contains': return !String(value).includes(cond.value);
        case 'starts_with': return String(value).startsWith(cond.value);
        case 'greater_than': return Number(value) > Number(cond.value);
        case 'less_than': return Number(value) < Number(cond.value);
        case 'in': return Array.isArray(cond.value) && cond.value.includes(value);
        default: return false;
      }
    });
  }

  _getFieldValue(field, conversation, extraData) {
    const data = { ...conversation.toObject?.(), ...extraData };
    return field.split('.').reduce((obj, key) => obj?.[key], data);
  }

  async _executeActions(actions, conversation, userId) {
    const results = [];
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'change_status': {
            await Conversation.findByIdAndUpdate(conversation._id, { status: action.config.status });
            results.push({ type: 'change_status', status: action.config.status });
            break;
          }
          case 'change_priority': {
            await Conversation.findByIdAndUpdate(conversation._id, { priority: action.config.priority });
            results.push({ type: 'change_priority', priority: action.config.priority });
            break;
          }
          case 'assign_agent': {
            await Conversation.findByIdAndUpdate(conversation._id, { assignedTo: action.config.agentId });
            results.push({ type: 'assign_agent', agentId: action.config.agentId });
            break;
          }
          case 'assign_department': {
            await Conversation.findByIdAndUpdate(conversation._id, { department: action.config.departmentId });
            results.push({ type: 'assign_department', departmentId: action.config.departmentId });
            break;
          }
          case 'add_tag': {
            await Conversation.findByIdAndUpdate(conversation._id, { $addToSet: { tags: { $each: action.config.tags } } });
            results.push({ type: 'add_tag', tags: action.config.tags });
            break;
          }
          case 'remove_tag': {
            await Conversation.findByIdAndUpdate(conversation._id, { $pullAll: { tags: action.config.tags } });
            results.push({ type: 'remove_tag', tags: action.config.tags });
            break;
          }
          case 'send_message': {
            await Message.create({
              conversation: conversation._id,
              sender: 'bot',
              content: action.config.message,
              type: 'text'
            });
            if (global.io) {
              global.io.to(`user-${userId}`).emit('new-message', { conversationId: conversation._id, content: action.config.message, sender: 'bot' });
            }
            results.push({ type: 'send_message' });
            break;
          }
          case 'notify': {
            if (global.io) {
              global.io.to(`user-${userId}`).emit('workflow-notification', { workflowName: action.config.message, conversationId: conversation._id });
            }
            results.push({ type: 'notify' });
            break;
          }
          default:
            results.push({ type: action.type, status: 'skipped' });
        }
      } catch (err) {
        results.push({ type: action.type, error: err.message });
      }
    }
    return results;
  }
}

module.exports = new WorkflowService();