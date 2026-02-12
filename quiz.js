// this script controls the quiz: load questions, manage state, update ui

document.addEventListener('DOMContentLoaded', function () { // wait for dom ready
  const statusElement = document.getElementById('quiz-status'); // shows "Question x of y"
  const questionTextElement = document.getElementById('quiz-question-text'); // question text area
  const optionsContainer = document.getElementById('quiz-options-container'); // where answer options go
  const feedbackElement = document.getElementById('quiz-feedback'); // shows feedback text
  const submitButton = document.getElementById('submit-answer-button'); // button to submit answer
  const nextButton = document.getElementById('next-question-button'); // button to move to next question
  const resultsSection = document.getElementById('quiz-results'); // final results section
  const scoreLine = document.getElementById('quiz-score-line'); // final score line
  const overallComment = document.getElementById('quiz-overall-comment'); // overall comment text
  const tipsContainer = document.getElementById('quiz-tips-container'); // container for tips by topic
  const goToFeedbackButton = document.getElementById('go-to-feedback-button'); // button to go to feedback page

  const quizState = { // central quiz state object
    questions: [], // all phishing questions
    currentIndex: 0, // current question index
    score: 0, // number of correct answers
    wrongTipsByTopic: {}, // topic -> list of tips
    perQuestion: [] // array of { hasSubmitted, isCorrect, hasScored }
  }; // end quizState

  // -------- data loading layer --------

  // topic from URL: ?topic=phishing|passwords|privacy -> filter questions
  const topicParam = (function () {
    const params = new URLSearchParams(window.location.search);
    return (params.get('topic') || 'phishing').toLowerCase();
  })();
  const topicMap = { phishing: 'Phishing awareness', passwords: 'Password security', privacy: 'Online privacy' };
  const topicLabel = topicMap[topicParam] || topicMap.phishing;

  const quizHeading = document.getElementById('quiz-heading');
  const quizIntro = document.getElementById('quiz-intro');
  if (quizHeading) quizHeading.textContent = topicLabel + ' quiz';
  if (quizIntro) quizIntro.textContent = 'Questions are loaded from data/questions.json and filtered by topic.';

  loadJsonFile('data/questions.json')
    .then(function (data) {
      if (!data || !Array.isArray(data)) {
        statusElement.textContent = 'Sorry, quiz questions could not be loaded.';
        submitButton.disabled = true;
        nextButton.disabled = true;
        return;
      }

      const filtered = data.filter(function (q) { return q.topic === topicLabel; });
      quizState.questions = filtered;
      quizState.perQuestion = filtered.map(function () {
        return { hasSubmitted: false, isCorrect: false, hasScored: false };
      });

      if (!quizState.questions.length) {
        statusElement.textContent = 'No questions found for this topic.';
        submitButton.disabled = true;
        nextButton.disabled = true;
        return;
      }

      renderQuestion(quizState, statusElement, questionTextElement, optionsContainer, feedbackElement, submitButton, nextButton);
    });

  // -------- controller: handling user actions --------

  submitButton.addEventListener('click', function () { // when user clicks submit answer
    if (!quizState.questions.length) return; // no questions loaded

    const selectedIndex = getSelectedOptionIndex(); // get index of chosen answer
    if (selectedIndex === null) { // if nothing is chosen
      alert('Please choose an answer before submitting.'); // ask user to pick something
      return; // stop here
    } // end selected check

    const question = quizState.questions[quizState.currentIndex]; // current question object
    const isCorrect = selectedIndex === question.correctIndex; // check if answer is right
    const qState = quizState.perQuestion[quizState.currentIndex]; // state for this question

    applyAnswerResult(quizState, qState, question, isCorrect); // update score and tips
    renderFeedback(feedbackElement, isCorrect, question); // update feedback text and style

    qState.hasSubmitted = true; // mark that user submitted at least once
    qState.isCorrect = isCorrect; // remember last correctness

    nextButton.disabled = false; // allow moving to next after at least one submit
  }); // end submit click handler

  nextButton.addEventListener('click', function () { // when user clicks next question
    const qState = quizState.perQuestion[quizState.currentIndex]; // state for current question
    if (!qState || !qState.hasSubmitted) { // if they have not submitted yet
      alert('Please submit an answer before continuing.'); // soft reminder
      return; // do nothing
    } // end submitted check

    quizState.currentIndex += 1; // move to next question index

    if (quizState.currentIndex >= quizState.questions.length) { // if we passed the last question
      finishQuiz(quizState, scoreLine, overallComment, tipsContainer, resultsSection); // show final results
    } else { // still more questions to go
      renderQuestion(quizState, statusElement, questionTextElement, optionsContainer, feedbackElement, submitButton, nextButton); // show next question
    } // end last question check
  }); // end next click handler

  if (goToFeedbackButton) { // if button exists in the dom
    goToFeedbackButton.addEventListener('click', function () { // handle click
      window.location.href = 'feedback.html'; // go to feedback form
    }); // end click handler
  } // end feedback button check

  // -------- state helpers --------

  function applyAnswerResult(quizState, qState, question, isCorrect) { // update score and tips safely
    if (isCorrect && !qState.hasScored) { // avoid double scoring
      quizState.score += 1;
      qState.hasScored = true;
    }

    if (!isCorrect) { // for wrong answers we track tips
      if (!quizState.wrongTipsByTopic[question.topic]) { // if this topic has no tips stored yet
        quizState.wrongTipsByTopic[question.topic] = []; // start a list for this topic
      } // end topic init
      if (quizState.wrongTipsByTopic[question.topic].indexOf(question.tip) === -1) { // avoid duplicate tips
        quizState.wrongTipsByTopic[question.topic].push(question.tip); // remember this tip for results screen
      } // end duplicate check
    } // end incorrect branch
  } // end applyAnswerResult

  // -------- rendering layer --------

  function renderQuestion(quizState, statusElement, questionTextElement, optionsContainer, feedbackElement, submitButton, nextButton) { // show current question
    const question = quizState.questions[quizState.currentIndex]; // get question

    statusElement.textContent = 'Question ' + (quizState.currentIndex + 1) + ' of ' + quizState.questions.length; // update status line
    questionTextElement.textContent = question.question; // put question text into legend

    optionsContainer.innerHTML = ''; // clear out any old options

    question.options.forEach(function (optionText, index) { // make each radio option
      const optionId = 'quiz-option-' + quizState.currentIndex + '-' + index; // build a unique id

      const wrapper = document.createElement('div'); // wrapper div for radio and label
      const radio = document.createElement('input'); // new radio input
      radio.type = 'radio'; // type is radio
      radio.name = 'quiz-options'; // same name so only one can be checked
      radio.id = optionId; // id for label to point to
      radio.value = String(index); // store index as a string

      const label = document.createElement('label'); // label for this radio
      label.setAttribute('for', optionId); // link label to radio
      label.textContent = optionText; // set label text

      wrapper.appendChild(radio); // put radio in wrapper
      wrapper.appendChild(label); // put label after it
      optionsContainer.appendChild(wrapper); // add wrapper to options container
    }); // end options loop

    feedbackElement.textContent = ''; // clear old feedback
    feedbackElement.className = ''; // clear feedback style classes

    submitButton.disabled = false; // always allow submitting on this question
    nextButton.disabled = true; // require at least one submit before next

    if (quizState.currentIndex === quizState.questions.length - 1) { // if this is last question
      nextButton.textContent = 'See results'; // tell user that results are next
    } else { // not last question
      nextButton.textContent = 'Next question'; // normal next label
    } // end last question check
  } // end renderQuestion

  function getSelectedOptionIndex() { // figure out which option is selected
    const radios = document.querySelectorAll('input[name="quiz-options"]'); // all quiz radio buttons
    for (let i = 0; i < radios.length; i += 1) { // loop over radios
      if (radios[i].checked) { // if this one is checked
        return parseInt(radios[i].value, 10); // return its numeric index
      } // end checked check
    } // end loop
    return null; // if none were checked, return null
  } // end getSelectedOptionIndex

  function renderFeedback(feedbackElement, isCorrect, question) { // show feedback line after answer
    const baseMessage = isCorrect ? 'Correct! ' : 'Not quite right. '; // pick start of the message
    feedbackElement.textContent = baseMessage + question.explanation; // show message plus explanation from json

    if (isCorrect) { // answer was correct
      feedbackElement.className = 'quiz-feedback-correct'; // use green style
    } else { // answer was wrong
      feedbackElement.className = 'quiz-feedback-incorrect'; // use red style
    } // end isCorrect check
  } // end renderFeedback

  function finishQuiz(quizState, scoreLine, overallComment, tipsContainer, resultsSection) { // finish quiz and show results
    const totalQuestions = quizState.questions.length; // how many questions we had
    let scoreOutOfTen = quizState.score; // start with raw score

    if (totalQuestions !== 10 && totalQuestions > 0) { // if not exactly 10
      scoreOutOfTen = Math.round((quizState.score / totalQuestions) * 10); // scale to 0-10
    } // end scale check

    scoreLine.textContent = 'You scored ' + scoreOutOfTen + ' out of 10.'; // show final score

    let comment = ''; // store simple sentence about performance
    if (scoreOutOfTen <= 4) { // low score
      comment = 'You might want to revisit the phishing lesson and then try again.'; // suggest revisiting lesson
    } else if (scoreOutOfTen <= 7) { // middle score
      comment = 'Nice effort. You have a decent base, but reviewing the tips below could make you more confident.'; // mixed feedback
    } else { // high score
      comment = 'Great work. You spotted most phishing tricks, but check the tips below for small improvements.'; // positive feedback
    } // end comment choice

    overallComment.textContent = comment; // show overall comment

    tipsContainer.innerHTML = ''; // clear any old tips

    const topics = Object.keys(quizState.wrongTipsByTopic); // get list of topics where mistakes happened

    if (topics.length === 0) { // if there were no wrong answers
      const allGoodPara = document.createElement('p'); // create a paragraph
      allGoodPara.textContent = 'You did not miss any questions, which means your answers were consistent across the phishing topic.'; // simple all-correct message
      tipsContainer.appendChild(allGoodPara); // add to tips container
    } else { // there were some mistakes
      topics.forEach(function (topicKey) { // go through each topic
        const topicBlock = document.createElement('div'); // create a block for this topic
        topicBlock.className = 'topic-tips'; // apply tips style

        const title = document.createElement('h5'); // small heading
        title.textContent = 'Tips for ' + topicKey; // include topic name

        const list = document.createElement('ul'); // list for tips
        quizState.wrongTipsByTopic[topicKey].forEach(function (tipText) { // loop over tips for this topic
          const li = document.createElement('li'); // create list item
          li.textContent = tipText; // put tip text inside
          list.appendChild(li); // add to list
        }); // end tips loop

        topicBlock.appendChild(title); // add heading to block
        topicBlock.appendChild(list); // add list under heading
        tipsContainer.appendChild(topicBlock); // add block to tips container
      }); // end topics loop
    } // end topics length check

    resultsSection.hidden = false; // show results section
    document.getElementById('quiz-form').hidden = true; // hide the quiz form now
    submitButton.disabled = true; // disable submit button
    nextButton.disabled = true; // disable next button
  } // end finishQuiz
}); // end dom ready handler for quiz setup

