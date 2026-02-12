## What is implemented

- **Navigation and user journey**
  - Home explains lessons, quiz, feedback. Lessons page lists three topics. Each topic has a dedicated lesson page (phishing full and interactive; password and privacy full but shorter). Each lesson ends with a CTA to the quiz for that topic. Quiz supports topic filter via URL (`?topic=phishing`, `?topic=passwords`, `?topic=privacy`).

- **Phishing lesson (fully interactive)**
  - Section 1: Short lesson content from `data/lessons.json`.
  - Section 2: Simulated fake university email with 6 clickable suspicious elements (sender, reply-to, urgent wording, generic greeting, link, attachment). Each click shows an explanation and marks the item as found. Progress text “X of 6 cues found”. When all are found, a final summary and checklist are shown.
  - Section 3: Mini knowledge check – 5 questions (mix of multiple choice and true/false), instant feedback and explanation per question, score tracked separately, short message at the end based on score.

- **Password and privacy lessons**
  - Full pages `lesson_passwords.html` and `lesson_privacy.html` with content from `data/lessons.json`, key points, and CTA to the quiz for that topic.

- **Quiz**
  - Loads questions from `data/questions.json`, filtered by topic from URL (default phishing). 10 questions per topic (or fewer; score scaled to /10). Shows “Question X of Y”, allows changing answer and resubmitting without double-counting. After each question: correct/incorrect plus explanation. At end: score out of 10, topic tips, button to feedback page.

- **Feedback**
  - Primary path: POST to `http://localhost:3001/api/feedback`. Success message and form clear on success; error message if backend offline. Submit button disabled while sending. No localStorage for final storage; backend is the only store.

- **Backend**
  - Node/Express on port 3001. `server/server.js`, `server/routes/feedbackRoutes.js`, `server/controllers/feedbackController.js`, `server/data/feedback.json`. POST saves feedback; GET returns all (for admin). Validation: text non-empty, max 500 characters; rating optional, 1–5 if present; timestamp set on server. CORS enabled for Live Server.

- **Admin page**
  - `admin_feedback.html` calls GET `/api/feedback` and lists entries. Warning that in a real deployment this would be protected.

- **Data**
  - `data/lessons.json`: full lesson texts for phishing, passwords, privacy.
  - `data/questions.json`: 30 questions (10 per topic), each with id, topic, question, options, correctIndex, explanation, tip.

## How to run

- **Frontend**: Open the project in VS Code (or similar), start Live Server so the site is served over `http://localhost:...` (e.g. 5500). This allows `fetch` to load JSON and call the backend.
- **Backend**: In a terminal, from the project root run `node server/server.js`. The API listens on `http://localhost:3001`. See RUN_GUIDE.md for step-by-step commands.

## Requirements checklist (mapping)

| Requirement | Status | Where |
|------------|--------|--------|
| Home explains lessons, quiz, feedback | Done | index.html |
| Lessons list + dedicated lesson pages | Done | lessons.html, lesson_phishing.html, lesson_passwords.html, lesson_privacy.html |
| Phishing lesson: 5+ cues, progress, summary, mini quiz | Done | lesson_phishing.html, phishingLesson.js |
| Quiz topic filter, 10 per topic, resubmit, score /10, tips, feedback CTA | Done | quiz.js, quiz.html, data/questions.json |
| Feedback backend-only, port 3001, success/error, disable/clear | Done | feedback.html, api.js, server/ |
| Admin page to prove feedback stored | Done | admin_feedback.html |
| Anonymous, no personal data | Done | No login; backend stores only text, optional rating, timestamp |
| Polished UI, nav, cards, responsive, a11y basics | Done | style.css, aria-live, labels, focus-visible |

## What is next (optional)

- Add authentication for the admin page in a real deployment.
- Add more lessons or quiz questions by editing the JSON files.
- Replace `feedback.json` with a proper database if needed for production.
