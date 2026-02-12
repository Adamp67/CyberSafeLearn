// routes for /api/feedback

const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.get('/', feedbackController.getFeedback); // GET all feedback (admin/testing)
router.post('/', feedbackController.createFeedback); // POST new feedback

module.exports = router;
