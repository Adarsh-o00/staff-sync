const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Clock in
// @route   POST /api/attendance/clock-in
// @access  Private
const clockIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already clocked in today
    let attendance = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (attendance && attendance.clockIn) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    const now = new Date();
    // Check if late (e.g. after 9:30 AM local time)
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const status = isLate ? 'late' : 'present';

    if (attendance) {
      attendance.clockIn = now;
      attendance.status = status;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        user: req.user._id,
        date: today,
        clockIn: now,
        status: status,
        totalHours: 0
      });
    }

    const populated = await Attendance.findById(attendance._id).populate('user', 'name email department');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clock out
// @route   POST /api/attendance/clock-out
// @access  Private
const clockOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ message: 'You have not clocked in today' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }

    const now = new Date();
    attendance.clockOut = now;

    // Calculate duration cleanly in hours
    const clockInTime = new Date(attendance.clockIn).getTime();
    const clockOutTime = now.getTime();
    const diffMs = Math.max(0, clockOutTime - clockInTime);
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    attendance.totalHours = totalHours;

    await attendance.save();

    const populated = await Attendance.findById(attendance._id).populate('user', 'name email department');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance history
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
  try {
    const { userId, startDate, endDate, status } = req.query;
    let query = {};

    if (req.user.role === 'employee') {
      query.user = req.user._id;
    } else if (userId) {
      query.user = userId;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const records = await Attendance.find(query)
      .populate('user', 'name email department position')
      .sort({ date: -1, clockIn: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's summary stats (total clocked in, absent, average work hours)
// @route   GET /api/attendance/today/summary or /api/attendance/stats
// @access  Private
const getTodaySummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const totalEmployees = await User.countDocuments({ isActive: true });

    const todayRecords = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd }
    }).populate('user', 'name email department position');

    const totalClockedIn = todayRecords.filter(r => r.clockIn).length;
    const currentlyClockedIn = todayRecords.filter(r => r.clockIn && !r.clockOut).length;
    const completedClockOut = todayRecords.filter(r => r.clockIn && r.clockOut);
    const totalLate = todayRecords.filter(r => r.status === 'late').length;
    const totalPresent = todayRecords.filter(r => r.status === 'present').length;
    const totalAbsent = Math.max(0, totalEmployees - totalClockedIn);

    const totalHoursSum = completedClockOut.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const averageWorkHours = completedClockOut.length > 0
      ? parseFloat((totalHoursSum / completedClockOut.length).toFixed(2))
      : 0;

    res.json({
      date: todayStart,
      totalEmployees,
      totalClockedIn,
      currentlyClockedIn,
      totalAbsent,
      totalLate,
      totalPresent,
      averageWorkHours,
      records: todayRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's today attendance status
// @route   GET /api/attendance/today
// @access  Private
const getMyTodayAttendance = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd }
    }).populate('user', 'name email department');

    res.json(attendance || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getAttendance,
  getTodaySummary,
  getMyTodayAttendance
};
