// Quiz: single-topic or master (all topics), per-topic scores, 80% mastery threshold

document.addEventListener('DOMContentLoaded', function () {
  const MASTERY_THRESHOLD_PCT = 80;
  const TOPIC_ORDER = ['Phishing awareness', 'Password security', 'Online privacy'];
  const TOPIC_TO_LESSON = {
    'Phishing awareness': 'lesson_phishing.html',
    'Password security': 'lesson_passwords.html',
    'Online privacy': 'lesson_privacy.html'
  };
  const SLUG_TO_TOPIC = {
    phishing: 'Phishing awareness',
    passwords: 'Password security',
    privacy: 'Online privacy'
  };

  const statusElement = document.getElementById('quiz-status');
  const questionTextElement = document.getElementById('quiz-question-text');
  const optionsContainer = document.getElementById('quiz-options-container');
  const feedbackElement = document.getElementById('quiz-feedback');
  const submitButton = document.getElementById('submit-answer-button');
  const nextButton = document.getElementById('next-question-button');
  const resultsSection = document.getElementById('quiz-results');
  const scoreLine = document.getElementById('quiz-score-line');
  const overallComment = document.getElementById('quiz-overall-comment');
  const tipsContainer = document.getElementById('quiz-tips-container');
  const goToFeedbackButton = document.getElementById('go-to-feedback-button');
  const submitErrorElement = document.getElementById('quiz-submit-error');
  const masteryBanner = document.getElementById('quiz-mastery-banner');
  const topicBreakdownList = document.getElementById('quiz-topic-breakdown-list');
  const reviseContainer = document.getElementById('quiz-revise-container');
  const reviseMessage = document.getElementById('quiz-revise-message');
  const reviseLink = document.getElementById('quiz-revise-link');
  const resultsHeadline = document.getElementById('quiz-results-headline');

  function shuffleArray(items) {
    const arr = items.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function clearSubmitError() {
    if (submitErrorElement) {
      submitErrorElement.textContent = '';
      submitErrorElement.hidden = true;
    }
  }

  function showSubmitError(message) {
    if (submitErrorElement) {
      submitErrorElement.textContent = message;
      submitErrorElement.hidden = false;
    }
  }

  document.addEventListener('change', function (e) {
    if (e.target && e.target.matches && e.target.matches('input[name="quiz-options"]')) {
      clearSubmitError();
    }
  });

  const quizState = {
    questions: [],
    currentIndex: 0,
    scoresByTopic: {},
    wrongTipsByTopic: {},
    perQuestion: [],
    isMasterQuiz: false,
    topicLabel: ''
  };

  const params = new URLSearchParams(window.location.search);
  const rawTopicParam = params.get('topic');
  const topicKey = rawTopicParam ? rawTopicParam.trim().toLowerCase() : '';
  quizState.isMasterQuiz = !rawTopicParam || rawTopicParam.trim() === '' || topicKey === 'all';
  quizState.topicLabel = quizState.isMasterQuiz ? '' : (SLUG_TO_TOPIC[topicKey] || SLUG_TO_TOPIC.phishing);

  const quizHeading = document.getElementById('quiz-heading');
  const quizIntro = document.getElementById('quiz-intro');
  if (quizHeading) {
    quizHeading.textContent = quizState.isMasterQuiz ? 'Master quiz' : quizState.topicLabel + ' quiz';
  }
  if (quizIntro) {
    quizIntro.textContent = quizState.isMasterQuiz
      ? 'All three topics in one quiz: phishing, passwords, and privacy. Score 80% or higher to earn mastery.'
      : 'Multiple-choice questions on this topic only. One chance per question — choose carefully.';
  }

  function initScoresByTopic(questions) {
    const scores = {};
    questions.forEach(function (q) {
      if (!scores[q.topic]) {
        scores[q.topic] = { correct: 0, total: 0 };
      }
      scores[q.topic].total += 1;
    });
    return scores;
  }

  loadJsonFile('data/questions.json')
    .then(function (data) {
      if (!data || !Array.isArray(data)) {
        statusElement.textContent = 'Sorry, quiz questions could not be loaded.';
        submitButton.disabled = true;
        nextButton.disabled = true;
        return;
      }

      const filtered = quizState.isMasterQuiz
        ? data.slice()
        : data.filter(function (q) { return q.topic === quizState.topicLabel; });

      quizState.scoresByTopic = initScoresByTopic(filtered);
      const ordered = quizState.isMasterQuiz ? shuffleArray(filtered) : filtered;
      quizState.questions = ordered;
      quizState.perQuestion = ordered.map(function () {
        return { answerLocked: false, isCorrect: false };
      });

      if (!quizState.questions.length) {
        statusElement.textContent = 'No questions found for this quiz.';
        submitButton.disabled = true;
        nextButton.disabled = true;
        return;
      }

      renderQuestion(quizState, statusElement, questionTextElement, optionsContainer, feedbackElement, submitButton, nextButton);
    });

  function setQuizRadiosDisabled(disabled) {
    document.querySelectorAll('input[name="quiz-options"]').forEach(function (r) {
      r.disabled = disabled;
    });
  }

  submitButton.addEventListener('click', function () {
    if (!quizState.questions.length) return;

    const qState = quizState.perQuestion[quizState.currentIndex];
    if (qState.answerLocked) return;

    const selectedIndex = getSelectedOptionIndex();
    if (selectedIndex === null) {
      showSubmitError('Please select an answer.');
      return;
    }

    clearSubmitError();

    const question = quizState.questions[quizState.currentIndex];
    const isCorrect = selectedIndex === question.correctIndex;

    qState.answerLocked = true;
    qState.isCorrect = isCorrect;
    setQuizRadiosDisabled(true);

    recordFirstAttemptOnly(quizState, question, isCorrect);
    renderFeedback(feedbackElement, isCorrect, question);

    submitButton.disabled = true;
    nextButton.disabled = false;
  });

  nextButton.addEventListener('click', function () {
    const qState = quizState.perQuestion[quizState.currentIndex];
    if (!qState || !qState.answerLocked) {
      showSubmitError('Please submit an answer before continuing.');
      return;
    }

    clearSubmitError();

    quizState.currentIndex += 1;

    if (quizState.currentIndex >= quizState.questions.length) {
      finishQuiz(quizState, scoreLine, overallComment, tipsContainer, resultsSection, submitButton, nextButton);
    } else {
      renderQuestion(quizState, statusElement, questionTextElement, optionsContainer, feedbackElement, submitButton, nextButton);
    }
  });

  if (goToFeedbackButton) {
    goToFeedbackButton.addEventListener('click', function () {
      window.location.href = 'feedback.html';
    });
  }

  function recordFirstAttemptOnly(quizState, question, isCorrect) {
    if (isCorrect && quizState.scoresByTopic[question.topic]) {
      quizState.scoresByTopic[question.topic].correct += 1;
    }

    if (!isCorrect) {
      if (!quizState.wrongTipsByTopic[question.topic]) {
        quizState.wrongTipsByTopic[question.topic] = [];
      }
      if (quizState.wrongTipsByTopic[question.topic].indexOf(question.tip) === -1) {
        quizState.wrongTipsByTopic[question.topic].push(question.tip);
      }
    }
  }

  function findWeakestTopic(scoresByTopic) {
    let minRatio = Infinity;
    let candidates = [];
    TOPIC_ORDER.forEach(function (topic) {
      const s = scoresByTopic[topic];
      if (!s || s.total === 0) return;
      const ratio = s.correct / s.total;
      if (ratio < minRatio) {
        minRatio = ratio;
        candidates = [topic];
      } else if (ratio === minRatio) {
        candidates.push(topic);
      }
    });
    if (!candidates.length) {
      return TOPIC_ORDER[0];
    }
    for (let i = 0; i < TOPIC_ORDER.length; i += 1) {
      if (candidates.indexOf(TOPIC_ORDER[i]) !== -1) {
        return TOPIC_ORDER[i];
      }
    }
    return candidates[0];
  }

  function renderQuestion(quizState, statusElement, questionTextElement, optionsContainer, feedbackElement, submitButton, nextButton) {
    const question = quizState.questions[quizState.currentIndex];

    statusElement.textContent = 'Question ' + (quizState.currentIndex + 1) + ' of ' + quizState.questions.length;
    questionTextElement.textContent = question.question;

    optionsContainer.innerHTML = '';

    question.options.forEach(function (optionText, index) {
      const optionId = 'quiz-option-' + quizState.currentIndex + '-' + index;

      const wrapper = document.createElement('div');
      wrapper.className = 'quiz-option-row';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'quiz-options';
      radio.id = optionId;
      radio.value = String(index);

      const label = document.createElement('label');
      label.setAttribute('for', optionId);
      label.textContent = optionText;

      wrapper.appendChild(radio);
      wrapper.appendChild(label);
      optionsContainer.appendChild(wrapper);
    });

    feedbackElement.textContent = '';
    feedbackElement.className = '';

    clearSubmitError();

    submitButton.disabled = false;
    nextButton.disabled = true;

    if (quizState.currentIndex === quizState.questions.length - 1) {
      nextButton.textContent = 'See results';
    } else {
      nextButton.textContent = 'Next question';
    }
  }

  function getSelectedOptionIndex() {
    const radios = document.querySelectorAll('input[name="quiz-options"]');
    for (let i = 0; i < radios.length; i += 1) {
      if (radios[i].checked) {
        return parseInt(radios[i].value, 10);
      }
    }
    return null;
  }

  function renderFeedback(feedbackElement, isCorrect, question) {
    const baseMessage = isCorrect ? 'Correct! ' : 'Not quite right. ';
    feedbackElement.textContent = baseMessage + question.explanation;

    if (isCorrect) {
      feedbackElement.className = 'quiz-feedback-correct';
    } else {
      feedbackElement.className = 'quiz-feedback-incorrect';
    }
  }

  function finishQuiz(quizState, scoreLine, overallComment, tipsContainer, resultsSection, submitButton, nextButton) {
    const totals = quizState.scoresByTopic;
    let totalCorrect = 0;
    let totalQuestions = 0;
    TOPIC_ORDER.forEach(function (topic) {
      if (totals[topic]) {
        totalCorrect += totals[topic].correct;
        totalQuestions += totals[topic].total;
      }
    });

    const overallPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    if (resultsHeadline) {
      if (overallPct >= MASTERY_THRESHOLD_PCT) {
        resultsHeadline.textContent = '🏆 Outstanding! You are a cybersecurity expert.';
        resultsHeadline.className = 'quiz-results-headline quiz-results-headline--success';
      } else {
        resultsHeadline.textContent = '📚 Good effort! But there are a few things we need to review.';
        resultsHeadline.className = 'quiz-results-headline quiz-results-headline--review';
      }
    }

    scoreLine.textContent =
      'You answered ' + totalCorrect + ' of ' + totalQuestions + ' correctly (' + overallPct + '%).';

    if (topicBreakdownList) {
      topicBreakdownList.innerHTML = '';
      TOPIC_ORDER.forEach(function (topic) {
        const s = totals[topic];
        if (!s || s.total === 0) return;
        const pct = Math.round((s.correct / s.total) * 100);
        const li = document.createElement('li');
        li.textContent = topic + ': ' + s.correct + '/' + s.total + ' (' + pct + '%)';
        topicBreakdownList.appendChild(li);
      });
    }

    if (masteryBanner) {
      if (overallPct >= MASTERY_THRESHOLD_PCT) {
        masteryBanner.hidden = false;
        masteryBanner.className = 'quiz-mastery-banner quiz-mastery-banner--success';
      } else {
        masteryBanner.hidden = true;
        masteryBanner.className = 'quiz-mastery-banner';
      }
    }

    if (overallPct >= MASTERY_THRESHOLD_PCT) {
      if (reviseContainer) reviseContainer.hidden = true;
      overallComment.textContent =
        'Mastery achieved. You scored at or above the ' + MASTERY_THRESHOLD_PCT + '% threshold. Keep practising these habits in real life.';
    } else {
      const weakest = findWeakestTopic(totals);
      const lessonHref = TOPIC_TO_LESSON[weakest] || 'lessons.html';
      if (reviseMessage) {
        reviseMessage.textContent =
          'You need to brush up on ' + weakest + ' before you reach mastery. Review the lesson below, then try the quiz again.';
      }
      if (reviseLink) {
        reviseLink.href = lessonHref;
        reviseLink.textContent = 'Review: ' + weakest;
      }
      if (reviseContainer) reviseContainer.hidden = false;
      overallComment.textContent =
        'You are below the ' + MASTERY_THRESHOLD_PCT + '% mastery threshold. Focus on your weakest topic and retake the quiz when ready.';
    }

    tipsContainer.innerHTML = '';

    const wrongTopics = Object.keys(quizState.wrongTipsByTopic);

    if (wrongTopics.length === 0) {
      const allGoodPara = document.createElement('p');
      allGoodPara.textContent =
        'You did not miss any questions. Strong work across every topic in this quiz.';
      tipsContainer.appendChild(allGoodPara);
    } else {
      wrongTopics.forEach(function (topicKey) {
        const topicBlock = document.createElement('div');
        topicBlock.className = 'topic-tips';

        const title = document.createElement('h5');
        title.textContent = 'Tips for ' + topicKey;

        const list = document.createElement('ul');
        quizState.wrongTipsByTopic[topicKey].forEach(function (tipText) {
          const li = document.createElement('li');
          li.textContent = tipText;
          list.appendChild(li);
        });

        topicBlock.appendChild(title);
        topicBlock.appendChild(list);
        tipsContainer.appendChild(topicBlock);
      });
    }

    resultsSection.hidden = false;
    document.getElementById('quiz-form').hidden = true;
    clearSubmitError();
    submitButton.disabled = true;
    nextButton.disabled = true;
  }
});
