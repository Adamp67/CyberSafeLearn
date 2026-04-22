// detect environment and set API base URL for feedback
var API_BASE_URL;
var h = window.location.hostname;
if (h === 'localhost' || h === '127.0.0.1' || h === '::1') {
  API_BASE_URL = 'http://localhost:3001';
} else {
  API_BASE_URL = 'https://cybersafelearn-api.onrender.com';
}
