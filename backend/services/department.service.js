const Department = require('../models/Department');
const User = require('../models/User');

class DepartmentService {
  async getDepartments(userId, params = {}) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const [departments, total] = await Promise.all([
      Department.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Department.countDocuments({ user: userId })
    ]);
    return { departments, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  async getDepartment(userId, deptId) {
    const dept = await Department.findOne({ _id: deptId, user: userId });
    if (!dept) throw new Error('القسم غير موجود');
    return dept;
  }

  async createDepartment(userId, data) {
    const dept = await Department.create({ ...data, user: userId });
    return dept;
  }

  async updateDepartment(userId, deptId, data) {
    const dept = await Department.findOneAndUpdate(
      { _id: deptId, user: userId },
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!dept) throw new Error('القسم غير موجود');
    return dept;
  }

  async deleteDepartment(userId, deptId) {
    const dept = await Department.findOneAndDelete({ _id: deptId, user: userId });
    if (!dept) throw new Error('القسم غير موجود');
    return dept;
  }

  async addAgent(userId, deptId, agentId) {
    const dept = await Department.findOne({ _id: deptId, user: userId });
    if (!dept) throw new Error('القسم غير موجود');
    if (dept.agents.includes(agentId)) throw new Error('الوكيل موجود بالفعل في هذا القسم');
    dept.agents.push(agentId);
    await dept.save();
    return dept;
  }

  async removeAgent(userId, deptId, agentId) {
    const dept = await Department.findOne({ _id: deptId, user: userId });
    if (!dept) throw new Error('القسم غير موجود');
    dept.agents = dept.agents.filter(id => id.toString() !== agentId);
    if (dept.lead && dept.lead.toString() === agentId) dept.lead = undefined;
    await dept.save();
    return dept;
  }

  async assignLead(userId, deptId, agentId) {
    const dept = await Department.findOne({ _id: deptId, user: userId });
    if (!dept) throw new Error('القسم غير موجود');
    dept.lead = agentId;
    await dept.save();
    return dept;
  }

  async getNextAgent(userId, deptId, channel) {
    const dept = await Department.findOne({ _id: deptId, user: userId });
    if (!dept) throw new Error('القسم غير موجود');

    if (dept.assignmentMode === 'manual') return null;

    if (dept.assignmentMode === 'round-robin') {
      return this._roundRobinAssign(dept);
    }

    if (dept.assignmentMode === 'least-busy') {
      return this._leastBusyAssign(dept, userId);
    }

    if (dept.assignmentMode === 'skill-based') {
      return this._skillBasedAssign(dept, channel);
    }

    return null;
  }

  async _roundRobinAssign(dept) {
    if (!dept.agents.length) return null;
    dept._lastAssignedIndex = ((dept._lastAssignedIndex || -1) + 1) % dept.agents.length;
    await dept.save();
    return dept.agents[dept._lastAssignedIndex];
  }

  async _leastBusyAssign(dept, userId) {
    if (!dept.agents.length) return null;
    const Conversation = require('../models/Conversation');
    const agentCounts = await Conversation.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId), status: 'active', assignedTo: { $in: dept.agents } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    agentCounts.forEach(a => { countMap[a._id.toString()] = a.count; });
    let minCount = Infinity, selectedAgent = dept.agents[0];
    for (const agentId of dept.agents) {
      const count = countMap[agentId.toString()] || 0;
      if (count < minCount) { minCount = count; selectedAgent = agentId; }
    }
    return selectedAgent;
  }

  async _skillBasedAssign(dept, channel) {
    const qualified = dept.agents.filter(() => !dept.channels.length || dept.channels.includes(channel));
    if (!qualified.length) return dept.agents[0] || null;
    const idx = Math.floor(Math.random() * qualified.length);
    return qualified[idx];
  }
}

module.exports = new DepartmentService();