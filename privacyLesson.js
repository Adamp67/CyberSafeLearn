// Spot the Overshare: 3 clickable cues, progress, summary (same pattern as phishingLesson.js)

document.addEventListener('DOMContentLoaded', function () {
  var interactive = document.getElementById('privacy-interactive');
  if (!interactive) return;

  var cueElements = interactive.querySelectorAll('.privacy-cue');
  var feedbackList = document.getElementById('privacy-feedback-list');
  var progressEl = document.getElementById('privacy-progress');
  var summaryBlock = document.getElementById('privacy-summary-block');
  var summaryText = document.getElementById('privacy-summary-text');

  var REQUIRED_CUES = 3;
  var lessonState = { foundCues: {} };

  var cueMessages = {
    location:
      'Geo-tags and exact addresses tell strangers where you live or spend time. Turn off precise location for posts or keep posts friends-only.',
    barcode:
      'Barcodes and QR codes on tickets can be copied from photos and used to steal entry or resell your seat. Cover them or post after the event.',
    address:
      'House numbers and street signs in the background identify your home. Combined with your name or school, that can be misused. Crop or blur background details.'
  };

  function updateProgress() {
    var n = Object.keys(lessonState.foundCues).length;
    if (progressEl) {
      progressEl.textContent = n + ' of ' + REQUIRED_CUES + ' cues found.';
    }
  }

  function showSummary() {
    if (!summaryBlock || !summaryText) return;
    summaryText.textContent =
      'You found every overshare risk in this post. Before you share photos, turn off precise location, hide ticket codes, and check what is visible in the background.';
    summaryBlock.hidden = false;
  }

  function onCueActivate(el, e) {
    if (el.tagName === 'A') e.preventDefault();
    var cueId = el.getAttribute('data-cue-id');
    if (!cueId) return;

    if (!lessonState.foundCues[cueId]) {
      lessonState.foundCues[cueId] = true;
      el.classList.add('privacy-cue-found');
      var li = document.createElement('li');
      li.textContent = cueMessages[cueId] || 'This detail could leak private information.';
      if (feedbackList) feedbackList.appendChild(li);
      updateProgress();
      if (Object.keys(lessonState.foundCues).length === REQUIRED_CUES) {
        showSummary();
      }
    } else if (progressEl) {
      progressEl.textContent = 'You already found that one. Find the remaining cues.';
    }
  }

  cueElements.forEach(function (el) {
    el.addEventListener('click', function (e) {
      onCueActivate(el, e);
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCueActivate(el, e);
      }
    });
  });

  updateProgress();
});
