// small helper for talking to the backend feedback api

function sendFeedbackToBackend(entry) { // send one feedback item to the server
  return fetch(API_BASE_URL + '/api/feedback', { // send feedback to API
    method: 'POST', // use POST to create feedback
    headers: { 'Content-Type': 'application/json' }, // send json
    body: JSON.stringify(entry) // convert object to json string
  }).then(function (response) { // when we get a response
    if (!response.ok) { // http status was not ok
      return false; // let caller know it failed
    } // end ok check
    return true; // success
  }); // end then
} // end sendFeedbackToBackend

