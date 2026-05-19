const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
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
  trigger: {
    type: {
      type: String,
      enum: ['conversation_created', 'status_change', 'priority_change', 'keyword_match', 'no_reply', 'department_change', 'csat_received'],
      required: true
    },
    conditions: [{
      field: String,
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'greater_than', 'less_than', 'in']
      },
      value: mongoose.Schema.Types.Mixed
    }]
  },
  actions: [{
    type: {
      type: String,
      enum: ['assign_agent', 'assign_department', 'change_status', 'change_priority', 'send_message', 'send_template', 'add_tag', 'remove_tag', 'escalate', 'notify', 'webhook', 'set_sla']
    },
    config: mongoose.Schema.Types.Mixed
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  executionCount: {
    type: Number,
    default: 0
  },
  lastExecutedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

WorkflowSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Workflow', WorkflowSchema);