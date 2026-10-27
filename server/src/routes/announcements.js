const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getAnnouncements)
  .post(protect, authorize('admin', 'manager'), createAnnouncement);

module.exports = router;
