const LeaveRequest = require('../models/LeaveRequest');

// @desc    Submit leave request
// @route   POST /api/leaves
// @access  Private
const submitLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please provide start date, end date, and reason' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date format' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be earlier than start date' });
    }

    const leaveRequest = await LeaveRequest.create({
      user: req.user._id,
      leaveType: leaveType || 'annual',
      startDate: start,
      endDate: end,
      reason,
      status: 'pending'
    });

    const populatedLeave = await LeaveRequest.findById(leaveRequest._id)
      .populate('user', 'name email department position');

    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leave requests (Employee sees own, Manager/Admin sees all or filtered)
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    const { status, leaveType, userId } = req.query;
    let query = {};

    if (req.user.role === 'employee') {
      query.user = req.user._id;
    } else if (userId) {
      query.user = userId;
    }

    if (status) {
      query.status = status;
    }

    if (leaveType) {
      query.leaveType = leaveType;
    }

    const leaves = await LeaveRequest.find(query)
      .populate('user', 'name email department position')
      .populate('approver', 'name email role')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leave statistics / metrics (pending, approved, rejected counts)
// @route   GET /api/leaves/stats
// @access  Private
const getLeaveStats = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'employee') {
      query.user = req.user._id;
    } else if (req.query.userId) {
      query.user = req.query.userId;
    }

    const [pending, approved, rejected, total] = await Promise.all([
      LeaveRequest.countDocuments({ ...query, status: 'pending' }),
      LeaveRequest.countDocuments({ ...query, status: 'approved' }),
      LeaveRequest.countDocuments({ ...query, status: 'rejected' }),
      LeaveRequest.countDocuments(query)
    ]);

    const byType = await LeaveRequest.aggregate([
      { $match: query },
      { $group: { _id: '$leaveType', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      pending,
      approved,
      rejected,
      total,
      byType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin / Manager)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Crucial check: employee/user cannot approve their own leaves
    if (leaveRequest.user.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'Employees cannot review or approve their own leave requests' });
    }

    leaveRequest.status = status;
    leaveRequest.approver = req.user._id;
    if (comments !== undefined) {
      leaveRequest.comments = comments;
    }

    await leaveRequest.save();

    const updatedLeave = await LeaveRequest.findById(leaveRequest._id)
      .populate('user', 'name email department position')
      .populate('approver', 'name email role department');

    res.json(updatedLeave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitLeaveRequest,
  getLeaves,
  getLeaveStats,
  updateLeaveStatus
};
