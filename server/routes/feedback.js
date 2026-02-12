// router for /api/feedback endpoints

const express = require('express'); // express router
const router = express.Router(); // create router

const feedbackController = require('../controllers/feedbackController'); // controller functions

router.get('/', feedbackController.getFeedback); // GET /api/feedback
router.post('/', feedbackController.createFeedback); // POST /api/feedback

module.exports = router; // export router

