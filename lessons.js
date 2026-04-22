// this script loads lesson data from lessons.json and shows it on the lessons pages

// only run once the html is ready
document.addEventListener('DOMContentLoaded', function () { // wait until dom is loaded
  const lessonsListContainer = document.getElementById('lessons-list'); // container used on lessons.html
  const singleLessonContainer = document.getElementById('lesson-content'); // container used on lesson_phishing.html

  if (!lessonsListContainer && !singleLessonContainer) { // if neither container exists
    return; // nothing to do on this page
  } // end container check

  loadJsonFile('data/lessons.json') // load lessons from the json file
    .then(function (lessonsData) { // run this when data is loaded
      if (!lessonsData) { // if data is null, loading failed
        if (lessonsListContainer) { // on the list page
          lessonsListContainer.textContent = 'Sorry, lessons could not be loaded.'; // show simple error text
        } // end list check
        if (singleLessonContainer) { // on the single lesson page
          singleLessonContainer.insertAdjacentText('beforeend', ' (Lesson content could not be loaded from JSON.)'); // add small error note
        } // end single lesson check
        return; // stop here because there is no data
      } // end data null check

      if (lessonsListContainer) { // if this page has the list container
        renderLessonCards(lessonsListContainer, lessonsData); // build lesson cards for all lessons
      } // end list page branch

      if (singleLessonContainer) { // if this page has the single lesson container
        renderSingleLesson(singleLessonContainer, lessonsData); // fill in the single lesson text
      } // end single lesson branch
    }); // end then
}); // end dom content loaded

const LESSON_CARD_EMOJI = {
  phishing: '🎣',
  passwords: '🔐',
  privacy: '👁️‍🗨️'
};

const LESSON_CARD_IMAGE = {
  phishing: {
    src: 'https://images.unsplash.com/photo-1596526131083-e8c633e9e2c8?auto=format&fit=crop&w=800&q=80',
    alt: 'Laptop screen with email — practice spotting phishing and suspicious messages.'
  },
  passwords: {
    src: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800&q=80',
    alt: 'Digital padlock and security concept — strong passwords and account protection.'
  },
  privacy: {
    src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    alt: 'Smartphone and online activity — thinking about what to share in public.'
  },
  _default: {
    src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    alt: 'Cybersecurity and technology — stay safer online.'
  }
};

// turn each lesson entry into a card on the lessons page
function renderLessonCards(container, lessonsData) { // container is where cards go, lessonsData is the array from json
  container.innerHTML = ''; // clear anything that was inside before

  lessonsData.forEach(function (lesson) { // loop over each lesson object
    const card = document.createElement('article'); // create a card element
    card.className = 'lesson-card'; // use lesson card styles

    const imageMeta = LESSON_CARD_IMAGE[lesson.id] || LESSON_CARD_IMAGE._default;

    const figure = document.createElement('figure');
    figure.className = 'lesson-card-media';

    const img = document.createElement('img');
    img.className = 'lesson-card-image';
    img.src = imageMeta.src;
    img.alt = imageMeta.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 800;
    img.height = 520;

    figure.appendChild(img);

    const body = document.createElement('div');
    body.className = 'lesson-card-body';

    const titleRow = document.createElement('div');
    titleRow.className = 'lesson-card-title-row';

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'lesson-card-emoji';
    emojiSpan.setAttribute('aria-hidden', 'true');
    emojiSpan.textContent = LESSON_CARD_EMOJI[lesson.id] || '📘';

    const title = document.createElement('h3'); // create title element
    title.textContent = lesson.title; // fill with title from json

    titleRow.appendChild(emojiSpan);
    titleRow.appendChild(title);

    const topicPara = document.createElement('p'); // create topic text
    topicPara.className = 'lesson-card-topic';
    topicPara.textContent = lesson.topic;

    const summaryPara = document.createElement('p'); // create summary text
    summaryPara.className = 'lesson-card-summary';
    summaryPara.textContent = lesson.text; // show short lesson text

    body.appendChild(titleRow);
    body.appendChild(topicPara);
    body.appendChild(summaryPara);

    const button = document.createElement('a'); // create button link
    const ctaMod = lesson.id && ['phishing', 'passwords', 'privacy'].indexOf(lesson.id) !== -1
      ? lesson.id
      : 'default';
    button.className = 'lesson-card-cta lesson-card-cta--' + ctaMod;
    button.setAttribute('role', 'button'); // hint to screen readers that this behaves like a button
    button.href = '#'; // default link for lessons without full pages yet

    if (lesson.id === 'phishing') {
      button.href = 'lesson_phishing.html';
      button.textContent = 'Start phishing lesson →';
    } else if (lesson.id === 'passwords') {
      button.href = 'lesson_passwords.html';
      button.textContent = 'Start password lesson →';
    } else if (lesson.id === 'privacy') {
      button.href = 'lesson_privacy.html';
      button.textContent = 'Start privacy lesson →';
    } else {
      button.textContent = 'Open lesson →';
    }

    const foot = document.createElement('div');
    foot.className = 'lesson-card-footer';
    foot.appendChild(button);

    card.appendChild(figure);
    card.appendChild(body);
    card.appendChild(foot);

    container.appendChild(card); // put card into container
  }); // end forEach
} // end renderLessonCards

// show just one lesson (phishing) on its own page
function renderSingleLesson(container, lessonsData) { // container is the main section, lessonsData is from json
  const lessonId = container.getAttribute('data-lesson-id'); // read id from data-lesson-id attribute

  const lesson = lessonsData.find(function (item) { // find the matching lesson
    return item.id === lessonId; // match by id string
  }); // end find

  if (!lesson) { // if we did not find a lesson
    container.insertAdjacentText('beforeend', ' (Lesson details not found in JSON.)'); // add small error note
    return; // stop here because we cannot fill content
  } // end null check

  const textContainer = document.getElementById('lesson-text-container'); // get div where short text goes
  if (!textContainer) { // if this element is missing
    return; // nothing we can safely update
  } // end text container check

  textContainer.textContent = lesson.text; // put the lesson text from json into the page
} // end renderSingleLesson

