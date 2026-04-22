// express server for feedback api; runs on port 3001 for Live Server compatibility

const express = require('express'); // web framework
const cors = require('cors'); // allow cross-origin requests from Live Server
const rateLimit = require('express-rate-limit'); // limit requests per IP to reduce abuse

const feedbackRouter = require('./routes/feedbackRoutes'); // router for feedback endpoints

const app = express(); // create app
const PORT = process.env.PORT || 3001; // use 3001 so frontend can call from any Live Server port

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP per window
  standardHeaders: true,
  legacyHeaders: false
});

app.use(globalLimiter); // apply to all routes
app.use(cors()); // allow requests from any origin (e.g. Live Server on 5500, 5501, etc.)
app.use(express.json()); // parse JSON request bodies

app.use('/api/feedback', feedbackRouter); // mount routes at /api/feedback

app.get('/', function (req, res) { // health check
  res.json({ status: 'CyberSafeLearn backend running', port: PORT });
});

app.listen(PORT, function () {
  console.log('CyberSafeLearn backend listening on port ' + PORT);
});
