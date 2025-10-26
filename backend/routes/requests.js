const express = require('express');
const { body, validationResult } = require('express-validator');
const Request = require('../models/Request');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/requests
// @desc    Create a new network request
// @access  Private (Client only)
router.post('/', [
  auth,
  authorize('Client'),
  body('requirements.campusName').notEmpty().withMessage('Campus name is required'),
  body('requirements.departments').isArray({ min: 1 }).withMessage('At least one department is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { requirements, priority = 'Medium' } = req.body;

    const request = new Request({
      client: req.user._id,
      requirements,
      priority
    });

    await request.save();
    await request.populate('client', 'name email');

    res.status(201).json({
      message: 'Network request created successfully',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error creating request' });
  }
});

// @route   GET /api/requests
// @desc    Get requests based on user role
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    let populateFields = ['client', 'assignedDesigner', 'assignedInstaller'];

    // Role-based filtering
    switch (req.user.role) {
      case 'Client':
        query.client = req.user._id;
        break;
      case 'Network Designer':
        query.assignedDesigner = req.user._id;
        break;
      case 'Network Installation Team':
        query.assignedInstaller = req.user._id;
        break;
      case 'Web Admin':
        // Web Admin can see all requests
        break;
      default:
        return res.status(403).json({ message: 'Access denied' });
    }

    const requests = await Request.find(query)
      .populate(populateFields, 'name email role')
      .populate('design')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// @route   GET /api/requests/:id
// @desc    Get a specific request
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('client', 'name email')
      .populate('assignedDesigner', 'name email')
      .populate('assignedInstaller', 'name email')
      .populate('design');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check access permissions
    const canAccess = 
      request.client._id.toString() === req.user._id.toString() ||
      request.assignedDesigner?._id.toString() === req.user._id.toString() ||
      request.assignedInstaller?._id.toString() === req.user._id.toString() ||
      req.user.role === 'Web Admin';

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error fetching request' });
  }
});

// @route   PUT /api/requests/:id/assign
// @desc    Assign request to designer or installer
// @access  Private (Web Admin only)
router.put('/:id/assign', [
  auth,
  authorize('Web Admin'),
  body('assignedDesigner').optional().isMongoId().withMessage('Invalid designer ID'),
  body('assignedInstaller').optional().isMongoId().withMessage('Invalid installer ID'),
  body('status').optional().isIn(['New', 'Assigned', 'Design In Progress', 'Design Complete', 'Installation In Progress', 'Completed'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { assignedDesigner, assignedInstaller, status } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Validate assigned users exist and have correct roles
    if (assignedDesigner) {
      const designer = await User.findById(assignedDesigner);
      if (!designer || designer.role !== 'Network Designer') {
        return res.status(400).json({ message: 'Invalid designer assignment' });
      }
    }

    if (assignedInstaller) {
      const installer = await User.findById(assignedInstaller);
      if (!installer || installer.role !== 'Network Installation Team') {
        return res.status(400).json({ message: 'Invalid installer assignment' });
      }
    }

    // Update request
    const updateData = {};
    if (assignedDesigner) updateData.assignedDesigner = assignedDesigner;
    if (assignedInstaller) updateData.assignedInstaller = assignedInstaller;
    if (status) updateData.status = status;

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate(['client', 'assignedDesigner', 'assignedInstaller'], 'name email role');

    res.json({
      message: 'Request updated successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Assign request error:', error);
    res.status(500).json({ message: 'Server error updating request' });
  }
});

// @route   PUT /api/requests/:id/status
// @desc    Update request status
// @access  Private
router.put('/:id/status', [
  auth,
  body('status').isIn(['New', 'Assigned', 'Design In Progress', 'Design Complete', 'Design Rejected', 'Installation In Progress', 'Completed'])
  .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check permissions based on role and current assignment
    const canUpdate = 
      (req.user.role === 'Web Admin') ||
      (req.user.role === 'Network Designer' && request.assignedDesigner?.toString() === req.user._id.toString()) ||
      (req.user.role === 'Network Installation Team' && request.assignedInstaller?.toString() === req.user._id.toString());

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate(['client', 'assignedDesigner', 'assignedInstaller'], 'name email role');

    res.json({
      message: 'Request status updated successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

module.exports = router;
