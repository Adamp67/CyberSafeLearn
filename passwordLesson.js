// Live Hacker Sandbox: real-time password checks, strength meter, mini quiz

document.addEventListener('DOMContentLoaded', function () {
  var interactive = document.getElementById('password-interactive');
  if (!interactive) return;

  var input = document.getElementById('password-test-input');
  var crackEl = document.getElementById('password-crack-estimate');
  var fillEl = document.getElementById('password-strength-fill');
  var meterEl = document.getElementById('password-strength-meter-el');
  var summaryBlock = document.getElementById('password-summary-block');
  var summaryText = document.getElementById('password-summary-text');
  var miniquizOpenBtn = document.getElementById('password-miniquiz-open');
  var miniquizSection = document.getElementById('password-miniquiz-section');

  var criteriaEls = {
    length: document.querySelector('[data-criterion="length"]'),
    upper: document.querySelector('[data-criterion="upper"]'),
    number: document.querySelector('[data-criterion="number"]'),
    special: document.querySelector('[data-criterion="special"]')
  };

  // Time-to-crack labels by how many criteria are met (educational estimate only)
  var CRACK_TIME_BY_MET = [
    'less than 1 second',
    'about 2 seconds',
    'a few minutes',
    'several months',
    'many years (much harder to crack by guessing)'
  ];

  function checkPassword(pwd) {
    return {
      length: pwd.length >= 12,
      upper: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };
  }

  function countMet(checks) {
    var n = 0;
    if (checks.length) n += 1;
    if (checks.upper) n += 1;
    if (checks.number) n += 1;
    if (checks.special) n += 1;
    return n;
  }

  function updateCriteriaRow(el, met) {
    if (!el) return;
    var icon = el.querySelector('.password-criterion-icon');
    el.classList.toggle('password-criterion--met', met);
    if (icon) {
      icon.textContent = met ? '✓' : '✗';
    }
  }

  function updateStrengthMeter(metCount) {
    var pct = metCount * 25;
    if (fillEl) {
      fillEl.style.width = pct + '%';
      fillEl.className = 'password-strength-fill';
      if (metCount === 0) fillEl.classList.add('password-strength-fill--none');
      else if (metCount === 1) fillEl.classList.add('password-strength-fill--weak');
      else if (metCount === 2) fillEl.classList.add('password-strength-fill--medium');
      else if (metCount === 3) fillEl.classList.add('password-strength-fill--good');
      else fillEl.classList.add('password-strength-fill--strong');
    }
    if (meterEl) {
      meterEl.setAttribute('aria-valuenow', String(metCount));
    }
  }

  function updateCrackTime(metCount) {
    if (!crackEl) return;
    crackEl.textContent =
      'A hacker could crack this in: ' + CRACK_TIME_BY_MET[metCount] + '.';
  }

  function showSummary() {
    if (!summaryBlock || !summaryText) return;
    summaryText.textContent =
      'Strong work. Your test password meets all four basic rules. Try the mini quiz next, then the full password quiz.';
    summaryBlock.hidden = false;
  }

  function hideSummary() {
    if (summaryBlock) summaryBlock.hidden = true;
  }

  function onInput() {
    var pwd = input ? input.value : '';
    var checks = checkPassword(pwd);
    var metCount = countMet(checks);

    updateCriteriaRow(criteriaEls.length, checks.length);
    updateCriteriaRow(criteriaEls.upper, checks.upper);
    updateCriteriaRow(criteriaEls.number, checks.number);
    updateCriteriaRow(criteriaEls.special, checks.special);

    updateStrengthMeter(metCount);
    updateCrackTime(metCount);

    if (metCount === 4) {
      showSummary();
    } else {
      hideSummary();
    }
  }

  if (input) {
    input.addEventListener('input', onInput);
    onInput();
  }

  // -------- Mini quiz (same flow as phishing lesson) --------
  var passwordMiniquizQuestions = [
    {
      question: 'What is the main risk of using the same password everywhere?',
      options: [
        'You might forget which site you used',
        'If one site leaks it, attackers can try it on your other accounts',
        'Websites will block duplicate passwords',
        'It makes your keyboard wear out faster'
      ],
      correctIndex: 1,
      explanation: 'Password reuse means one breach can unlock many accounts.'
    },
    {
      question: 'True or false: A long passphrase made of several random words is usually stronger than a short password with mixed characters.',
      options: ['True', 'False'],
      correctIndex: 0,
      explanation: 'Length adds a lot of guessing difficulty; passphrases are a practical way to get length.'
    },
    {
      question: 'Two-factor authentication (2FA) helps because:',
      options: [
        'It replaces your password every day',
        'Even if someone steals your password, they still need a second step',
        'It removes the need for strong passwords',
        'It only works on university Wi‑Fi'
      ],
      correctIndex: 1,
      explanation: 'The second factor (e.g. app or SMS code) blocks logins that only have the password.'
    },
    {
      question: 'Where is a sticky note with your password on your monitor?',
      options: ['A good backup', 'Easy for anyone nearby to read', 'Required by IT', 'Encrypted storage'],
      correctIndex: 1,
      explanation: 'Visible written passwords defeat the purpose of secrecy.'
    },
    {
      question: 'After a website you use reports a breach, what should you do first if you reused that password?',
      options: [
        'Nothing until you see fraud',
        'Change it on that site and on every other site where you used the same password',
        'Email the hackers to delete your data',
        'Turn off two-factor authentication'
      ],
      correctIndex: 1,
      explanation: 'Reuse spreads risk; update every account that shared that password.'
    }
  ];

  var mqStatus = document.getElementById('password-miniquiz-status');
  var mqQuestionBlock = document.getElementById('password-miniquiz-question-block');
  var mqQuestionText = document.getElementById('password-miniquiz-question-text');
  var mqOptions = document.getElementById('password-miniquiz-options');
  var mqFeedback = document.getElementById('password-miniquiz-answer-feedback');
  var mqResultBlock = document.getElementById('password-miniquiz-result-block');
  var mqScoreLine = document.getElementById('password-miniquiz-score-line');
  var mqMessage = document.getElementById('password-miniquiz-message');
  var mqRetry = document.getElementById('password-miniquiz-retry');

  var mqState = { index: 0, score: 0, answered: [] };

  function renderMqQuestion() {
    var q = passwordMiniquizQuestions[mqState.index];
    mqStatus.textContent =
      'Question ' + (mqState.index + 1) + ' of ' + passwordMiniquizQuestions.length;
    mqQuestionText.textContent = q.question;
    mqOptions.innerHTML = '';
    mqFeedback.textContent = '';
    mqFeedback.className = 'miniquiz-feedback';

    q.options.forEach(function (opt, i) {
      var label = document.createElement('label');
      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'password-miniquiz-opt';
      radio.value = String(i);
      label.appendChild(radio);
      label.appendChild(document.createTextNode(' ' + opt));
      mqOptions.appendChild(label);
    });
  }

  function getMqSelected() {
    var r = document.querySelector('input[name="password-miniquiz-opt"]:checked');
    return r === null ? null : parseInt(r.value, 10);
  }

  function onMqAnswer() {
    if (mqState.answered.length !== mqState.index) return;
    var selected = getMqSelected();
    if (selected === null) {
      mqFeedback.textContent = 'Please choose an answer.';
      return;
    }
    var q = passwordMiniquizQuestions[mqState.index];
    var correct = selected === q.correctIndex;
    if (correct) mqState.score += 1;
    mqFeedback.textContent = (correct ? 'Correct. ' : 'Not quite. ') + q.explanation;
    mqFeedback.className =
      'miniquiz-feedback ' + (correct ? 'miniquiz-correct' : 'miniquiz-incorrect');
    mqState.answered.push({ correct: correct });
    document.querySelectorAll('input[name="password-miniquiz-opt"]').forEach(function (r) {
      r.disabled = true;
    });

    setTimeout(function () {
      if (mqState.index + 1 >= passwordMiniquizQuestions.length) {
        finishMq();
      } else {
        mqState.index += 1;
        renderMqQuestion();
      }
    }, 2000);
  }

  function finishMq() {
    mqQuestionBlock.hidden = true;
    mqResultBlock.hidden = false;
    var total = passwordMiniquizQuestions.length;
    mqScoreLine.textContent =
      'You got ' + mqState.score + ' out of ' + total + ' correct.';
    if (mqState.score <= 2) {
      mqMessage.textContent = 'Review the key points above and try the main password quiz when you are ready.';
    } else if (mqState.score <= 4) {
      mqMessage.textContent = 'Good effort. The full quiz will help you reinforce these ideas.';
    } else {
      mqMessage.textContent = 'Well done. You are ready for the full password quiz.';
    }
  }

  function startPasswordMiniquiz() {
    mqState.index = 0;
    mqState.score = 0;
    mqState.answered = [];
    mqResultBlock.hidden = true;
    mqQuestionBlock.hidden = false;
    renderMqQuestion();
  }

  if (mqOptions) {
    mqOptions.addEventListener('change', function () {
      if (mqState.answered.length > mqState.index) return;
      onMqAnswer();
    });
  }

  if (mqRetry) {
    mqRetry.addEventListener('click', startPasswordMiniquiz);
  }

  if (miniquizOpenBtn && miniquizSection) {
    miniquizOpenBtn.addEventListener('click', function () {
      miniquizSection.hidden = false;
      startPasswordMiniquiz();
      miniquizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});
