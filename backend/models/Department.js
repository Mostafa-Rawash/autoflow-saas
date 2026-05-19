const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  icon: {
    type: String,
    default: 'users'
  },
  color: {
    type: String,
    default: '#14b8a6'
  },
  agents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  channels: [{
    type: String,
    enum: ['whatsapp', 'telegram', 'messenger', 'instagram', 'email', 'livechat']
  }],
  assignmentMode: {
    type: String,
    enum: ['manual', 'round-robin', 'skill-based', 'least-busy'],
    default: 'round-robin'
  },
  escalationRules: [{
    targetDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    afterMinutes: {
      type: Number,
      default: 30
    },
    notifyLead: {
      type: Boolean,
      default: true
    }
  }],
  workSchedule: {
    timezone: {
      type: String,
      default: 'Africa/Cairo'
    },
    workingDays: [{
      type: Number,
      min: 0,
      max: 6
    }],
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    outsideHoursAction: {
      type: String,
      enum: ['queue', 'auto-reply', 'none'],
      default: 'auto-reply'
    },
    outsideHoursMessage: {
      type: String,
      default: 'نعتذر، نحن خارج ساعات العمل حالياً. سنرد عليك في أقرب وقت ممكن.'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

DepartmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Department', DepartmentSchema);