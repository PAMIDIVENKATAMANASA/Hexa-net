const express = require('express');
const { body, validationResult } = require('express-validator');
const Device = require('../models/Device');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/devices
// @desc    Get all devices
// @access  Private (Web Admin only)
router.get('/devices', [auth, authorize('Web Admin')], async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    if (type) {
      query.type = type;
    }

    const devices = await Device.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Device.countDocuments(query);

    res.json({
      devices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ message: 'Server error fetching devices' });
  }
});

// @route   GET /api/admin/devices/:id
// @desc    Get a specific device
// @access  Private (Web Admin only)
router.get('/devices/:id', [auth, authorize('Web Admin')], async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json({ device });
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({ message: 'Server error fetching device' });
  }
});

// @route   POST /api/admin/devices
// @desc    Create a new device
// @access  Private (Web Admin only)
router.post('/devices', [
  auth,
  authorize('Web Admin'),
  body('modelName').notEmpty().withMessage('Model name is required'),
  body('type').isIn(['Router', 'CoreSwitch', 'DistributionSwitch', 'AccessSwitch', 'AccessPoint'])
    .withMessage('Invalid device type'),
  body('specifications.portCount').isNumeric().withMessage('Port count must be a number'),
  body('unitPrice').isNumeric().withMessage('Unit price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const device = new Device(req.body);
    await device.save();

    res.status(201).json({
      message: 'Device created successfully',
      device
    });
  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({ message: 'Server error creating device' });
  }
});

// @route   PUT /api/admin/devices/:id
// @desc    Update a device
// @access  Private (Web Admin only)
router.put('/devices/:id', [
  auth,
  authorize('Web Admin'),
  body('modelName').optional().notEmpty().withMessage('Model name cannot be empty'),
  body('type').optional().isIn(['Router', 'CoreSwitch', 'DistributionSwitch', 'AccessSwitch', 'AccessPoint'])
    .withMessage('Invalid device type'),
  body('unitPrice').optional().isNumeric().withMessage('Unit price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const device = await Device.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json({
      message: 'Device updated successfully',
      device
    });
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({ message: 'Server error updating device' });
  }
});

// @route   DELETE /api/admin/devices/:id
// @desc    Delete a device (soft delete)
// @access  Private (Web Admin only)
router.delete('/devices/:id', [auth, authorize('Web Admin')], async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json({
      message: 'Device deleted successfully',
      device
    });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ message: 'Server error deleting device' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Web Admin only)
router.get('/users', [auth, authorize('Web Admin')], async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Web Admin only)
router.get('/stats', [auth, authorize('Web Admin')], async (req, res) => {
  try {
    const Request = require('../models/Request');
    const LogicDesign = require('../models/LogicDesign');

    const [
      totalRequests,
      newRequests,
      inProgressRequests,
      completedRequests,
      totalUsers,
      totalDevices,
      totalDesigns
    ] = await Promise.all([
      Request.countDocuments(),
      Request.countDocuments({ status: 'New' }),
      Request.countDocuments({ 
        status: { $in: ['Assigned', 'Design In Progress', 'Installation In Progress'] } 
      }),
      Request.countDocuments({ status: 'Completed' }),
      User.countDocuments({ isActive: true }),
      Device.countDocuments({ isActive: true }),
      LogicDesign.countDocuments()
    ]);

    res.json({
      requests: {
        total: totalRequests,
        new: newRequests,
        inProgress: inProgressRequests,
        completed: completedRequests
      },
      users: {
        total: totalUsers
      },
      devices: {
        total: totalDevices
      },
      designs: {
        total: totalDesigns
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

module.exports = router;
