const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getAttendance,
  getTodaySummary,
  getMyTodayAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/today/summary', protect, getTodaySummary);
router.get('/stats', protect, getTodaySummary);
router.get('/today', protect, getMyTodayAttendance);
router.get('/', protect, getAttendance);

module.exports = router;
