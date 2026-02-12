// interactive phishing lesson: 6 clickable cues, progress, summary checklist, and mini quiz

document.addEventListener('DOMContentLoaded', function () {
  const interactiveSection = document.getElementById('phishing-interactive');
  if (!interactiveSection) return;

  const cueElements = interactiveSection.querySelectorAll('.phishing-cue');
  const feedbackList = document.getElementById('phishing-feedback-list');
  const progressEl = document.getElementById('phishing-progress');
  const summaryBlock = document.getElementById('phishing-summary-block');
  const summaryText = document.getElementById('phishing-summary');
  const checklistEl = document.getElementById('phishing-checklist');

  const REQUIRED_CUES = 6; // must find 6 cues to complete
  const lessonState = { totalCues: cueElements.length, foundCues: {} };

  const cueMessages = {
    sender: 'The sender address is not a normal university domain; real IT would use @university.ac.uk.',
    replyto: 'Reply-To is different from From and uses a random domain so your reply goes to the attacker.',
    urgent: 'Urgent deadlines like "30 minutes or locked" are used to pressure you into clicking without thinking.',
    greeting: 'Generic greetings like "Dear Student" suggest a mass mail-out, not a real message to you.',
    link: 'Link text can say "secure" but the real URL could be fake; never trust the text alone.',
    attachment: 'Unexpected .zip attachments asking for account details are a common phishing trick.'
  };

  const checklistItems = [
    'Check sender and Reply-To addresses',
    'Look for urgent or threatening language',
    'Hover over links to see the real URL',
    'Avoid opening unexpected attachments',
    'When in doubt, go to the official site in a new tab'
  ];

  cueElements.forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (el.tagName === 'A') e.preventDefault();
      const cueId = el.getAttribute('data-cue-id');
      if (!cueId) return;

      if (!lessonState.foundCues[cueId]) {
        lessonState.foundCues[cueId] = true;
        el.classList.add('phishing-cue-found');
        const li = document.createElement('li');
        li.textContent = cueMessages[cueId] || 'This part looks suspicious.';
        feedbackList.appendChild(li);
        updateProgress(lessonState, progressEl);
        if (Object.keys(lessonState.foundCues).length === REQUIRED_CUES) {
          showSummary(summaryText, summaryBlock, checklistEl, checklistItems);
        }
      } else {
        progressEl.textContent = 'You already found that one. Find the remaining cues.';
      }
    });
  });

  function updateProgress(state, el) {
    const n = Object.keys(state.foundCues).length;
    el.textContent = n + ' of ' + REQUIRED_CUES + ' cues found.';
  }

  function showSummary(summaryPara, block, listEl, items) {
    summaryPara.textContent = 'You spotted all the main phishing signs in this email. Use the checklist below to remember what to look for next time.';
    listEl.innerHTML = '';
    items.forEach(function (item) {
      const li = document.createElement('li');
      li.textContent = item;
      listEl.appendChild(li);
    });
    block.hidden = false;
  }

  // -------- Mini quiz (5 questions, instant feedback, score) --------
  const miniquizQuestions = [
    { question: 'Phishing emails often try to make you act quickly. True or false?', options: ['True', 'False'], correctIndex: 0, explanation: 'Creating urgency is a common trick so you click before thinking.' },
    { question: 'If an email says it is from your university but the sender address is @gmail.com, what should you do?', options: ['Trust it if the logo looks right', 'Treat it as suspicious and go to the official university site yourself', 'Reply and ask for proof', 'Forward it to everyone'], correctIndex: 1, explanation: 'Sender address is more reliable than logos, which can be copied. Go to the real site yourself.' },
    { question: 'Hovering over a link before clicking can show you the real destination URL. True or false?', options: ['True', 'False'], correctIndex: 0, explanation: 'Most browsers show the real URL in the status bar or tooltip when you hover.' },
    { question: 'A message says "Your account will be locked in 1 hour" and has a link to "fix it". The safest first step is:', options: ['Click the link and log in', 'Open the official website in a new tab and log in there', 'Reply to the email', 'Ignore it completely'], correctIndex: 1, explanation: 'Going to the official site yourself avoids fake login pages.' },
    { question: 'Generic greetings like "Dear Customer" or "Dear Student" in an email are a sign of:', options: ['A personalised message from your tutor', 'A mass mail-out, which could be phishing', 'A test email from IT', 'Nothing important'], correctIndex: 1, explanation: 'Real organisations often use your name when they contact you; generic greetings can mean a scam.' }
  ];

  const miniquizContainer = document.getElementById('miniquiz-container');
  const miniquizStatus = document.getElementById('miniquiz-status');
  const questionBlock = document.getElementById('miniquiz-question-block');
  const questionText = document.getElementById('miniquiz-question-text');
  const optionsContainer = document.getElementById('miniquiz-options');
  const answerFeedback = document.getElementById('miniquiz-answer-feedback');
  const resultBlock = document.getElementById('miniquiz-result-block');
  const scoreLine = document.getElementById('miniquiz-score-line');
  const messageEl = document.getElementById('miniquiz-message');
  const retryBtn = document.getElementById('miniquiz-retry');

  if (!questionBlock || !optionsContainer) return;

  const miniquizState = { index: 0, score: 0, answered: [] };

  function startMiniquiz() {
    miniquizState.index = 0;
    miniquizState.score = 0;
    miniquizState.answered = [];
    resultBlock.hidden = true;
    questionBlock.hidden = false;
    renderMiniquizQuestion();
  }

  function renderMiniquizQuestion() {
    const q = miniquizQuestions[miniquizState.index];
    miniquizStatus.textContent = 'Question ' + (miniquizState.index + 1) + ' of ' + miniquizQuestions.length;
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    answerFeedback.textContent = '';
    answerFeedback.className = 'miniquiz-feedback';

    q.options.forEach(function (opt, i) {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'miniquiz-opt';
      radio.value = String(i);
      label.appendChild(radio);
      label.appendChild(document.createTextNode(' ' + opt));
      optionsContainer.appendChild(label);
    });
  }

  function getMiniquizSelected() {
    const r = document.querySelector('input[name="miniquiz-opt"]:checked');
    return r === null ? null : parseInt(r.value, 10);
  }

  function onMiniquizAnswer() {
    if (miniquizState.answered.length !== miniquizState.index) return; // already answered this question
    const selected = getMiniquizSelected();
    if (selected === null) {
      answerFeedback.textContent = 'Please choose an answer.';
      return;
    }
    const q = miniquizQuestions[miniquizState.index];
    const correct = selected === q.correctIndex;
    if (correct) miniquizState.score += 1;
    answerFeedback.textContent = (correct ? 'Correct. ' : 'Not quite. ') + q.explanation;
    answerFeedback.className = correct ? 'miniquiz-feedback miniquiz-correct' : 'miniquiz-feedback miniquiz-incorrect';
    miniquizState.answered.push({ correct: correct });
    document.querySelectorAll('input[name="miniquiz-opt"]').forEach(function (r) { r.disabled = true; });

    setTimeout(function () {
      if (miniquizState.index + 1 >= miniquizQuestions.length) {
        finishMiniquiz();
      } else {
        miniquizState.index += 1;
        renderMiniquizQuestion();
      }
    }, 2000);
  }

  function finishMiniquiz() {
    questionBlock.hidden = true;
    resultBlock.hidden = false;
    const total = miniquizQuestions.length;
    scoreLine.textContent = 'You got ' + miniquizState.score + ' out of ' + total + ' correct.';
    if (miniquizState.score <= 2) messageEl.textContent = 'Review the lesson and try the main quiz to practise more.';
    else if (miniquizState.score <= 4) messageEl.textContent = 'Good effort. Try the main phishing quiz to reinforce what you learned.';
    else messageEl.textContent = 'Well done. You are ready for the main quiz.';
  }

  optionsContainer.addEventListener('change', function () {
    if (miniquizState.answered.length > miniquizState.index) return;
    onMiniquizAnswer();
  });

  if (retryBtn) retryBtn.addEventListener('click', startMiniquiz);

  startMiniquiz();
});
