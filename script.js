// small helper file for shared javascript

// this loads a JSON file using fetch
function loadJsonFile(path) { // shared helper for lessons and quiz
  return fetch(path) // fetch the file from this relative path
    .then(function (response) { // run this when the response comes back
      if (!response.ok) { // if the http status is not ok
        throw new Error('Failed to load JSON from ' + path); // throw a simple error
      } // end status check
      return response.json(); // turn the body into a javascript object/array
    }) // end then
    .catch(function (error) { // if something goes wrong
      console.error(error); // log error to console so I can see it
      return null; // return null so callers can handle missing data
    }); // end catch
} // end loadJsonFile

// NOTE: fetch will usually not work for file:// urls
// I run this project using a simple live server so the JSON loads over http