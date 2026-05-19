const Contact = require('../models/Contact');
const Conversation = require('../models/Conversation');

class ContactService {
  async getContacts(userId, params = {}) {
    const { page = 1, limit = 20, search, source, tag } = params;
    const query = { user: userId, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (source) query.source = source;
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;
    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Contact.countDocuments(query)
    ]);

    return { contacts, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async getContact(userId, contactId) {
    const contact = await Contact.findOne({ _id: contactId, user: userId });
    if (!contact) throw new Error('جهة الاتصال غير موجودة');
    return contact;
  }

  async createContact(userId, data) {
    const contact = await Contact.create({ ...data, user: userId });
    return contact;
  }

  async updateContact(userId, contactId, data) {
    const contact = await Contact.findOneAndUpdate(
      { _id: contactId, user: userId },
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!contact) throw new Error('جهة الاتصال غير موجودة');
    return contact;
  }

  async deleteContact(userId, contactId) {
    const contact = await Contact.findOneAndUpdate(
      { _id: contactId, user: userId },
      { isActive: false },
      { new: true }
    );
    if (!contact) throw new Error('جهة الاتصال غير موجودة');
    return contact;
  }

  async mergeContacts(userId, primaryId, secondaryId) {
    const primary = await Contact.findOne({ _id: primaryId, user: userId });
    const secondary = await Contact.findOne({ _id: secondaryId, user: userId });
    if (!primary || !secondary) throw new Error('جهة الاتصال غير موجودة');

    primary.email = [...new Set([...primary.email, ...secondary.email])];
    primary.phone = [...new Set([...primary.phone, ...secondary.phone])];
    primary.tags = [...new Set([...primary.tags, ...secondary.tags])];
    if (!primary.company && secondary.company) primary.company = secondary.company;
    if (!primary.title && secondary.title) primary.title = secondary.title;
    if (!primary.notes && secondary.notes) primary.notes = secondary.notes;

    await Conversation.updateMany(
      { 'contact.externalId': secondary.externalIds?.whatsapp || secondary.externalIds?.telegram },
      { 'contact.name': primary.name, 'contact.phone': primary.phone?.[0], 'contact.email': primary.email?.[0] }
    );

    await primary.save();
    await Contact.findByIdAndUpdate(secondaryId, { isActive: false });
    return primary;
  }

  async getContactConversations(userId, contactId) {
    const contact = await Contact.findOne({ _id: contactId, user: userId });
    if (!contact) throw new Error('جهة الاتصال غير موجودة');

    const phoneNumbers = contact.phone;
    const emails = contact.email;
    const externalIds = Object.values(contact.externalIds || {}).filter(Boolean);

    const orConditions = [];
    if (phoneNumbers.length) orConditions.push({ 'contact.phone': { $in: phoneNumbers } });
    if (emails.length) orConditions.push({ 'contact.email': { $in: emails } });
    if (externalIds.length) orConditions.push({ 'contact.externalId': { $in: externalIds } });

    if (orConditions.length === 0) return [];

    return Conversation.find({ user: userId, $or: orConditions })
      .sort({ updatedAt: -1 })
      .limit(20);
  }
}

module.exports = new ContactService();