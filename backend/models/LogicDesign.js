const mongoose = require('mongoose');

const billOfMaterialsSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  }
});

const ipPlanSchema = new mongoose.Schema({
  vlanId: {
    type: Number,
    required: true,
    min: 1,
    max: 4094
  },
  departmentName: {
    type: String,
    required: true
  },
  subnet: {
    type: String,
    required: true
  },
  subnetMask: {
    type: String,
    required: true
  },
  networkAddress: {
    type: String,
    required: true
  },
  broadcastAddress: {
    type: String,
    required: true
  },
  usableHosts: {
    type: Number,
    required: true
  },
  hostCount: {
    type: Number,
    required: true
  }
});

const logicDesignSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  billOfMaterials: [billOfMaterialsSchema],
  ipPlan: [ipPlanSchema],
  topologyDiagram: {
    type: String,
    required: true
  },
  totalEstimatedCost: {
    type: Number,
    required: true,
    min: 0
  },
  designNotes: {
    type: String,
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
logicDesignSchema.index({ request: 1 });
logicDesignSchema.index({ isApproved: 1 });

module.exports = mongoose.model('LogicDesign', logicDesignSchema);
