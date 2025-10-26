const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  status: {
    type: String,
    enum: ['New', 'Assigned', 'Design In Progress', 'Design Complete', 'Installation In Progress', 'Completed'],
    default: 'New'
  },
  assignedDesigner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v) {
        return !v || this.status !== 'New';
      },
      message: 'Cannot assign designer to new requests'
    }
  },
  assignedInstaller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v) {
        return !v || ['Design Complete', 'Installation In Progress', 'Completed'].includes(this.status);
      },
      message: 'Cannot assign installer until design is complete'
    }
  },
  requirements: {
    campusName: {
      type: String,
      required: [true, 'Campus name is required']
    },
    departments: [{
      name: {
        type: String,
        required: true
      },
      rooms: [{
        name: {
          type: String,
          required: true
        },
        wiredHosts: {
          type: Number,
          default: 0,
          min: 0
        },
        wirelessHosts: {
          type: Number,
          default: 0,
          min: 0
        }
      }]
    }],
    additionalRequirements: {
      type: String,
      trim: true
    }
  },
  design: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LogicDesign'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  estimatedCompletionDate: {
    type: Date
  },
  actualCompletionDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
requestSchema.index({ client: 1, status: 1 });
requestSchema.index({ assignedDesigner: 1, status: 1 });
requestSchema.index({ assignedInstaller: 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);
