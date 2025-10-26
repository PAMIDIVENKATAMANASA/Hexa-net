const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: [true, 'Model name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Router', 'CoreSwitch', 'DistributionSwitch', 'AccessSwitch', 'AccessPoint'],
    required: [true, 'Device type is required']
  },
  specifications: {
    portCount: {
      type: Number,
      required: true
    },
    poeCapable: {
      type: Boolean,
      default: false
    },
    maxThroughput: {
      type: String,
      default: 'N/A'
    },
    powerConsumption: {
      type: String,
      default: 'N/A'
    },
    dimensions: {
      type: String,
      default: 'N/A'
    }
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);
