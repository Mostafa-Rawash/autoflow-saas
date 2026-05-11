const AutoReply = require('../models/AutoReply');

class AutoReplyService {
  async findMatch(userId, text) {
    if (!text || typeof text !== 'string') return null;

    const rules = await AutoReply.find({ user: userId, isActive: true })
      .sort({ priority: -1, createdAt: 1 });

    for (const rule of rules) {
      const matched = rule.keywords.some(keyword => {
        switch (rule.matchType) {
          case 'exact':
            return text.toLowerCase() === keyword.toLowerCase();
          case 'contains':
            return text.toLowerCase().includes(keyword.toLowerCase());
          case 'startsWith':
            return text.toLowerCase().startsWith(keyword.toLowerCase());
          case 'regex':
            try {
              const regex = new RegExp(keyword, 'i');
              return regex.test(text);
            } catch {
              return false;
            }
          default:
            return text.toLowerCase().includes(keyword.toLowerCase());
        }
      });

      if (matched) {
        rule.usageCount = (rule.usageCount || 0) + 1;
        await rule.save();
        return rule;
      }
    }

    return null;
  }
}

module.exports = new AutoReplyService();