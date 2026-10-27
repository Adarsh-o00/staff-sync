const express = require('express');
const router = express.Router();
const {
  submitLeaveRequest,
  getLeaves,
  getLeaveStats,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, submitLeaveRequest)
  .get(protect, getLeaves);

router.get('/stats', protect, getLeaveStats);

router.route('/:id/status')
  .put(protect, authorize('admin', 'manager'), updateLeaveStatus);

module.exports = router;
