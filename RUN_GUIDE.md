# How to run CyberSafeLearn

## 1. Start the backend (Node)

Open a terminal in the project folder (e.g. `CyberSafeLearn`).

1. Install dependencies once (if not already done):
   ```bash
   npm install express cors
   ```

2. Start the server:
   ```bash
   node server/server.js
   ```

You should see: `CyberSafeLearn backend listening on port 3001`.

Leave this terminal running. The API will be at `http://localhost:3001`.

## 2. Start the frontend (Live Server)

1. Open the project in VS Code (or Cursor).
2. Install the “Live Server” extension if you do not have it.
3. Right‑click `index.html` and choose **Open with Live Server**, or use the “Go Live” button in the status bar.

The site will open in your browser at a URL like `http://127.0.0.1:5500` (port may vary).

## 3. Test feedback saving

1. In the browser, go to **Feedback** (or open `feedback.html`).
2. Type some text in the feedback box (e.g. “Test feedback”).
3. Click **Submit feedback**.

- If the backend is running: you should see a green success message and the form should clear.
- If the backend is not running: you will see an error message asking you to start the server on port 3001.

## 4. Open the admin feedback page

1. In the browser, open `admin_feedback.html` (e.g. from the file list or by going to `http://127.0.0.1:5500/admin_feedback.html` if 5500 is your Live Server port).

2. The page will call `GET http://localhost:3001/api/feedback` and list all stored feedback entries in a table.

- If the backend is running: you will see the count and the table.
- If the backend is not running: you will see a message that the backend is not reachable.

## Summary

| Step | Command / action |
|------|-------------------|
| Backend | `node server/server.js` (port 3001) |
| Frontend | Live Server on `index.html` (e.g. port 5500) |
| Test feedback | Submit a message on `feedback.html` |
| View stored feedback | Open `admin_feedback.html` |
