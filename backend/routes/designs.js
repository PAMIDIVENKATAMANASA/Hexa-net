const express = require('express');
const { body, validationResult } = require('express-validator');
const Request = require('../models/Request');
const LogicDesign = require('../models/LogicDesign');
const Device = require('../models/Device');
const { auth, authorize } = require('../middleware/auth');
const { generateDesign } = require('../services/designService');

const router = express.Router();

// @route   POST /api/designs/generate/:requestId
// @desc    Generate logical design for a request
// @access  Private (Network Designer only)
router.post('/generate/:requestId', [
  auth,
  authorize('Network Designer')
], async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId)
      .populate('client', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if designer is assigned to this request
    if (request.assignedDesigner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this request.' });
    }

    // Check if design already exists
    if (request.design) {
      return res.status(400).json({ message: 'Design already exists for this request' });
    }

    // Generate the design
    const designData = await generateDesign(request);

    // Create the LogicDesign document
    const logicDesign = new LogicDesign({
      request: request._id,
      ...designData
    });

    await logicDesign.save();

    // Update the request with the design reference
    request.design = logicDesign._id;
    request.status = 'Design In Progress';
    await request.save();

    // Populate the design data for response
    await logicDesign.populate('billOfMaterials.device');

    res.status(201).json({
      message: 'Design generated successfully',
      design: logicDesign
    });
  } catch (error) {
    console.error('Generate design error:', error);
    res.status(500).json({ message: 'Server error generating design' });
  }
});

// @route   GET /api/designs/:id
// @desc    Get a specific design
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const design = await LogicDesign.findById(req.params.id)
      .populate('request')
      .populate('billOfMaterials.device')
      .populate('approvedBy', 'name email');

    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check access permissions
    const request = design.request;
    const canAccess = 
      request.client.toString() === req.user._id.toString() ||
      request.assignedDesigner?.toString() === req.user._id.toString() ||
      request.assignedInstaller?.toString() === req.user._id.toString() ||
      req.user.role === 'Web Admin';

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ design });
  } catch (error) {
    console.error('Get design error:', error);
    res.status(500).json({ message: 'Server error fetching design' });
  }
});

// @route   PUT /api/designs/:id
// @desc    Update a specific design (BOM, IP Plan, Diagram Syntax)
// @access  Private (Network Designer only)
router.put('/:id', [
  auth,
  authorize('Network Designer'),
  body('billOfMaterials').optional().isArray().withMessage('BOM must be an array'),
  body('ipPlan').optional().isArray().withMessage('IP Plan must be an array'),
  body('topologyDiagram').optional().isString().withMessage('Topology diagram must be a string'),
  body('totalEstimatedCost').optional().isNumeric().withMessage('Total cost must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { billOfMaterials, ipPlan, topologyDiagram, totalEstimatedCost } = req.body;
    const design = await LogicDesign.findById(req.params.id).populate('request');

    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check assignment and approval status
    if (design.request.assignedDesigner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this request.' });
    }
    if (design.isApproved) {
      return res.status(400).json({ message: 'Cannot edit an approved design.' });
    }

    // Prepare update object
    const updateFields = {};
    if (billOfMaterials) updateFields.billOfMaterials = billOfMaterials;
    if (ipPlan) updateFields.ipPlan = ipPlan;
    if (topologyDiagram) updateFields.topologyDiagram = topologyDiagram;
    if (totalEstimatedCost) updateFields.totalEstimatedCost = totalEstimatedCost;
    
    // Perform update
    const updatedDesign = await LogicDesign.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('billOfMaterials.device');

    res.json({
      message: 'Design updated successfully (Draft Saved)',
      design: updatedDesign
    });
  } catch (error) {
    console.error('Update design error:', error);
    res.status(500).json({ message: 'Server error updating design' });
  }
});


// @route   PUT /api/designs/:id/approve
// @desc    Approve a design
// @access  Private (Network Designer only)
router.put('/:id/approve', [
  auth,
  authorize('Network Designer'),
  body('designNotes').optional().isString().withMessage('Design notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { designNotes } = req.body;
    const design = await LogicDesign.findById(req.params.id).populate('request');

    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check if designer is assigned to this request
    if (design.request.assignedDesigner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this request.' });
    }
    
    // Check if it's already approved
    if (design.isApproved) {
        return res.status(400).json({ message: 'Design is already approved.' });
    }

    // Update design document fields
    design.isApproved = true;
    design.approvedBy = req.user._id;
    design.approvedAt = new Date();
    if (designNotes) {
      design.designNotes = designNotes;
    }

    // Save the updated design document
    await design.save(); 

    // FIX: Update the Request status directly using findByIdAndUpdate for reliability
    const requestId = design.request._id;
    const updatedRequest = await Request.findByIdAndUpdate(
        requestId,
        { status: 'Design Complete' },
        { new: true }
    );

    if (!updatedRequest) {
        return res.status(504).json({ message: 'Design approved, but failed to update main request status.' });
    }

    res.json({
      message: 'Design approved successfully',
      design
    });
  } catch (error) {
    console.error('Approve design error:', error);
    res.status(500).json({ message: 'Server error approving design' });
  }
});

// @route   GET /api/designs/request/:requestId
// @desc    Get design for a specific request
// @access  Private
router.get('/request/:requestId', auth, async (req, res) => {
  try {
    const design = await LogicDesign.findOne({ request: req.params.requestId })
      .populate('billOfMaterials.device')
      .populate('approvedBy', 'name email');

    if (!design) {
      return res.status(404).json({ message: 'Design not found for this request' });
    }

    // Check access permissions through the request
    const request = await Request.findById(req.params.requestId);
    const canAccess = 
      request.client.toString() === req.user._id.toString() ||
      request.assignedDesigner?.toString() === req.user._id.toString() ||
      request.assignedInstaller?.toString() === req.user._id.toString() ||
      req.user.role === 'Web Admin';

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ design });
  } catch (error) {
    console.error('Get design by request error:', error);
    res.status(500).json({ message: 'Server error fetching design' });
  }
});

module.exports = router;