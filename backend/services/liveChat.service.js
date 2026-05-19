const LiveChatConfig = require('../models/LiveChat');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const mongoose = require('mongoose');

class LiveChatService {
  async getConfig(userId) {
    let config = await LiveChatConfig.findOne({ user: userId });
    if (!config) {
      config = await LiveChatConfig.create({ user: userId });
    }
    return config;
  }

  async updateConfig(userId, data) {
    const config = await LiveChatConfig.findOneAndUpdate(
      { user: userId },
      { ...data, updatedAt: Date.now() },
      { new: true, upsert: true, runValidators: true }
    );
    return config;
  }

  async getWidgetConfig(userId) {
    const config = await LiveChatConfig.findOne({ user: userId, isActive: true });
    if (!config) return null;
    return {
      title: config.title,
      subtitle: config.subtitle,
      welcomeMessage: config.welcomeMessage,
      offlineMessage: config.offlineMessage,
      primaryColor: config.primaryColor,
      position: config.position,
      avatar: config.avatar,
      requireUserInfo: config.requireUserInfo,
      preChatForm: config.preChatForm,
      operatingHours: config.operatingHours,
      isOnline: this._isWithinOperatingHours(config)
    };
  }

  _isWithinOperatingHours(config) {
    if (!config.operatingHours?.enabled) return true;
    const now = new Date();
    const day = now.getDay();
    const schedule = config.operatingHours.schedule.find(s => s.day === day);
    if (!schedule || !schedule.isAvailable) return false;
    const [startH, startM] = schedule.start.split(':').map(Number);
    const [endH, endM] = schedule.end.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= startH * 60 + startM && currentMinutes <= endH * 60 + endM;
  }

  async initiateChat(userId, visitorData) {
    const config = await LiveChatConfig.findOne({ user: userId, isActive: true });
    if (!config) throw new Error('الدردشة المباشرة غير مفعلة');

    const conversation = await Conversation.create({
      user: userId,
      channel: 'livechat',
      contact: {
        name: visitorData.name || 'زائر',
        email: visitorData.email,
        phone: visitorData.phone,
        externalId: visitorData.visitorId
      },
      department: config.department || undefined,
      assignedTo: config.autoAssignment ? await this._assignAgent(userId, config) : undefined,
      timeline: [{ action: 'created', from: '', to: 'active', timestamp: new Date() }]
    });

    if (config.welcomeMessage) {
      await Message.create({
        conversation: conversation._id,
        sender: 'bot',
        content: config.welcomeMessage,
        type: 'text'
      });
    }

    if (global.io) {
      global.io.to(`user-${userId}`).emit('new-conversation', conversation);
    }

    return conversation;
  }

  async _assignAgent(userId, config) {
    if (config.department) {
      const departmentService = require('./department.service');
      const agentId = await departmentService.getNextAgent(userId, config.department.toString(), 'livechat');
      return agentId;
    }
    return undefined;
  }

  async sendVisitorMessage(conversationId, messageData) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error('المحادثة غير موجودة');

    const message = await Message.create({
      conversation: conversationId,
      sender: 'contact',
      content: messageData.content,
      type: messageData.type || 'text'
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: { content: messageData.content, timestamp: new Date(), sender: 'contact' },
      $inc: { unreadCount: 1 },
      $push: { timeline: { action: 'created', timestamp: new Date() } }
    });

    if (global.io) {
      global.io.to(`user-${conversation.user.toString()}`).emit('new-message', { conversationId, message });
    }

    return message;
  }
}

module.exports = new LiveChatService();