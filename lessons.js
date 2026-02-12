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

// turn each lesson entry into a card on the lessons page
function renderLessonCards(container, lessonsData) { // container is where cards go, lessonsData is the array from json
  container.innerHTML = ''; // clear anything that was inside before

  lessonsData.forEach(function (lesson) { // loop over each lesson object
    const card = document.createElement('article'); // create a card element
    card.className = 'lesson-card'; // use lesson card styles

    const title = document.createElement('h3'); // create title element
    title.textContent = lesson.title; // fill with title from json

    const topicPara = document.createElement('p'); // create topic text
    topicPara.textContent = 'Topic: ' + lesson.topic; // show topic name

    const summaryPara = document.createElement('p'); // create summary text
    summaryPara.textContent = lesson.text; // show short lesson text

    const button = document.createElement('a'); // create button link
    button.className = 'secondary-button'; // style as secondary button
    button.setAttribute('role', 'button'); // hint to screen readers that this behaves like a button
    button.href = '#'; // default link for lessons without full pages yet

    if (lesson.id === 'phishing') {
      button.href = 'lesson_phishing.html';
      button.textContent = 'Open phishing lesson';
    } else if (lesson.id === 'passwords') {
      button.href = 'lesson_passwords.html';
      button.textContent = 'Open password lesson';
    } else if (lesson.id === 'privacy') {
      button.href = 'lesson_privacy.html';
      button.textContent = 'Open privacy lesson';
    } else {
      button.textContent = 'Open lesson';
    }

    card.appendChild(title); // add title to card
    card.appendChild(topicPara); // add topic line
    card.appendChild(summaryPara); // add summary text
    card.appendChild(button); // add button

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

