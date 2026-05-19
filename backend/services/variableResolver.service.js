/**
 * Variable Resolver Service
 * Resolves {{variable}} placeholders in template text using conversation contact data.
 * Shared by auto-replies, follow-ups, and message sending.
 */

const VARIABLE_MAP = {
  // English keys
  name: (c) => c.contact?.name || '',
  phone: (c) => c.contact?.phone || '',
  email: (c) => c.contact?.email || '',
  channel: (c) => c.channel || '',
  status: (c) => c.status || '',
  last_message: (c) => c.lastMessage?.content || '',

  // Arabic keys
  'الاسم': (c) => c.contact?.name || '',
  'اسم': (c) => c.contact?.name || '',
  'هاتف': (c) => c.contact?.phone || '',
  'رقم': (c) => c.contact?.phone || '',
  'رقم_الهاتف': (c) => c.contact?.phone || '',
  'بريد': (c) => c.contact?.email || '',
  'البريد': (c) => c.contact?.email || '',
};

/**
 * Replace {{variable}} placeholders in text with values from conversation contact data.
 * Unknown variables are left as-is (e.g., {{order_id}} stays if not in the map).
 * @param {string} templateText - The text containing {{var}} placeholders
 * @param {Object} conversation - Mongoose conversation document (must have .contact, .channel, .status, .lastMessage)
 * @returns {string} - The text with known variables resolved
 */
function resolveVariables(templateText, conversation) {
  if (!templateText || !conversation) return templateText || '';

  return templateText.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    // Try exact match first (case-sensitive for Arabic), then lowercase for English
    const resolver = VARIABLE_MAP[varName] || VARIABLE_MAP[varName.toLowerCase()];
    if (resolver) {
      const value = resolver(conversation);
      return value || match; // Keep original {{var}} if value is empty
    }
    return match; // Leave unknown variables as-is
  });
}

/**
 * Get list of all supported variable names (for UI display)
 * @returns {Array<{key: string, label: string}>}
 */
function getSupportedVariables() {
  return [
    { key: 'name', label: 'الاسم' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'channel', label: 'القناة' },
    { key: 'status', label: 'الحالة' },
    { key: 'last_message', label: 'آخر رسالة' },
  ];
}

module.exports = { resolveVariables, getSupportedVariables, VARIABLE_MAP };