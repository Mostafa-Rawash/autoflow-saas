const AutoReply = require('../models/AutoReply');
const Template = require('../models/Template');
const { resolveVariables } = require('./variableResolver.service');

class AutoReplyService {
  /**
   * Find a matching auto-reply rule for the given text.
   * If a rule matches and has a templateId, resolve the template content.
   * If a conversation is provided, resolve {{variables}} from contact data.
   * @param {string} userId - The user ID to search rules for
   * @param {string} text - The incoming message text to match against
   * @param {Object} conversation - Optional conversation object for variable resolution
   * @returns {{ rule: Object, resolvedResponse: string } | null}
   */
  async findMatch(userId, text, conversation = null) {
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

        // Resolve content: template or direct response
        let responseText = rule.response || '';

        if (rule.templateId) {
          try {
            const template = await Template.findById(rule.templateId);
            if (template) {
              responseText = template.content?.text || template.content || '';
            }
          } catch {
            // Template lookup failed, use direct response as fallback
          }
        }

        // Resolve {{variables}} from conversation contact data
        if (conversation && responseText) {
          responseText = resolveVariables(responseText, conversation);
        }

        return { rule, resolvedResponse: responseText };
      }
    }

    return null;
  }
}

module.exports = new AutoReplyService();