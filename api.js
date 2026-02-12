// small helper for talking to the backend feedback api

function sendFeedbackToBackend(entry) { // send one feedback item to the server
  return fetch('http://localhost:3001/api/feedback', { // url of express backend
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

