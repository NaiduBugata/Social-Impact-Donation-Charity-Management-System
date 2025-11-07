# Simple Video Call Demo

This repository contains a minimal Socket.IO + simple-peer (WebRTC) server and a static frontend you can open in the browser to test video calls locally.

Files added:
- `server.js` — Socket.IO server (already present). Now serves the static frontend from `public/`.
- `public/index.html` — Simple static frontend. Open this in two browser windows to test.
- `public/client.js` — Frontend logic (uses `/socket.io/socket.io.js` and `simple-peer` via CDN).

How to run
1. Install dependencies (if you haven't already):

```powershell
cd "C:\Users\girin\OneDrive\Attachments\Desktop\video"
npm install
```

2. Start the server:

```powershell
npm run start
```

3. Open two browser windows/tabs and visit:

http://localhost:5000

4. Allow camera/microphone access in both tabs. In one tab copy the "Your ID" value and paste it into the other tab's "ID to call" field, then click Call. Accept the incoming call in the receiving tab.

Notes & troubleshooting
- The frontend uses `simple-peer` via unpkg and the Socket.IO client that is served by the server at `/socket.io/socket.io.js`.
- If cameras/mics don't work, ensure the browser has permission and that no other app is blocking access.
- For cross-machine testing (different devices), update the client connection to point to the server host (instead of using relative `/`) and ensure ports are reachable.

If you'd like, I can:
- Convert the static frontend into a small React app with a build step.
- Add simple logging on the server to display when calls are relayed.
- Add an npm `dev` script that runs nodemon and auto-restarts.
