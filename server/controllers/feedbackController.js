// controller functions for feedback api

const fs = require('fs'); // file system for reading/writing json
const path = require('path'); // build safe paths

const dataPath = path.join(__dirname, '..', 'data', 'feedback.json'); // path to json file

function readFeedbackFile() { // read feedback.json as array
  try { // try to read file
    const raw = fs.readFileSync(dataPath, 'utf8'); // read file contents
    if (!raw.trim()) return []; // empty file => empty array
    return JSON.parse(raw); // parse existing json
  } catch (err) { // if file missing or broken
    return []; // return empty array as safe default
  } // end try/catch
} // end readFeedbackFile

function writeFeedbackFile(list) { // write array back to feedback.json
  fs.writeFileSync(dataPath, JSON.stringify(list, null, 2), 'utf8'); // save pretty printed json
} // end writeFeedbackFile

function validateFeedback(payload) { // basic server side validation
  const text = typeof payload.text === 'string' ? payload.text.trim() : ''; // normalise text
  const rating = payload.rating; // rating as sent from client

  if (!text || text.length < 1) return 'Feedback text cannot be empty.';
  if (text.length > 500) return 'Feedback text must be 500 characters or fewer.'; // limit length

  if (typeof rating === 'string' && rating !== '') { // if rating is provided
    const num = Number(rating); // convert to number
    if (!Number.isInteger(num) || num < 1 || num > 5) { // must be 1-5
      return 'Rating must be 1 to 5 or empty.'; // rating error
    } // end rating range check
  } // end rating check

  // note: we intentionally do not try to guess personal data here, user is told to avoid it on the form
  return null; // no validation error
} // end validateFeedback

exports.getFeedback = function (req, res) { // handle GET /api/feedback
  const feedbackList = readFeedbackFile(); // read from json file
  res.json(feedbackList); // send list back to caller
}; // end getFeedback

exports.createFeedback = function (req, res) { // handle POST /api/feedback
  const validationError = validateFeedback(req.body); // run validation
  if (validationError) { // if invalid
    return res.status(400).json({ error: validationError }); // send 400 with error message
  } // end validation check

  const feedbackList = readFeedbackFile(); // read current list

  const newEntry = { // build new stored entry
    id: Date.now(), // simple numeric id based on time
    text: req.body.text.trim(), // feedback text
    rating: req.body.rating || '', // rating or empty string
    timestamp: new Date().toISOString() // server timestamp
  }; // end newEntry

  feedbackList.push(newEntry); // add new entry to list
  writeFeedbackFile(feedbackList); // persist back to json file

  res.status(201).json({ message: 'Feedback stored', id: newEntry.id }); // send success response
}; // end createFeedback

