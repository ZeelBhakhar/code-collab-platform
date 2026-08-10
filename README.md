🚀 CollabCode – Real-Time Code Collaboration Platform

CollabCode is a real-time collaborative coding platform designed to help developers write, edit, and test code together in shared online rooms.

The platform enables multiple users to work on the same code simultaneously, with changes synchronized instantly through WebSockets. It also provides a live preview panel so users can execute and visualize their HTML, CSS, and JavaScript code in real time.

🌐 Live Demo

Frontend: https://code-collab-platform-snowy.vercel.app

Backend API: https://code-collab-platform-edb7.onrender.com 

✨ Features

🔄 Real-Time Code Synchronization

Multiple users can edit code simultaneously inside the same room. Code changes are synchronized instantly using WebSocket-based communication.

💻 Professional Code Editor

CollabCode uses Monaco Editor, the same editor technology that powers Visual Studio Code, providing a familiar and powerful coding experience.

⚡ Live Code Preview

Users can execute their HTML, CSS, and JavaScript code and instantly view the output inside a secure preview area using an HTML <iframe>.

🏠 Collaborative Rooms

Each session is organized into a unique room. Users can create a room and share the Room ID with other developers to start collaborating.

👥 Multi-User Collaboration

Multiple users can join the same room and work together on the same codebase in real time.

🌙 Responsive Dark UI

The application provides a modern dark-themed interface designed for comfortable and focused coding sessions.

🛠️ Technology Stack
Category:	Technology
Frontend:	React.js, Vite
Code Editor:	Monaco Editor
Styling:	CSS3
Backend:	Node.js, Express.js
Real-Time Communication:	Socket.io, WebSockets
Frontend Deployment:	Vercel
Backend Deployment:	Render

🔁 How It Works
A user creates a new collaboration room or joins an existing room using a Room ID.
The React frontend establishes a WebSocket connection with the Node.js backend.
When a user modifies the code, the frontend emits a code-change event through Socket.io.
The backend receives the updated code and identifies the users connected to the same room.
The updated code is broadcast to other users in that room.
Connected clients receive the update and automatically synchronize their editors.
Users can execute the code and view the result through the live preview panel.

🔧 Local Development Setup

To run this platform inside your local workstation, execute the following workflow:

1. Clone the remote repository down to your computer:
   ```bash
   git clone https://github.com/ZeelBhakhar/code-collab-platform 
   cd code-collab-platform
   ```

2. Provision global node dependency packages:
   ```bash
   npm install
   ```

3. Spin up the localized compiler development environments:
   ```bash
   npm run dev
   ```
4. Fire up your active browser application and navigate to: 'http://localhost:5173'

🚀 Commands to Upload it to GitHub:Open your Command Prompt (cmd) inside your project directory and execute these three terminal steps:
git add README.md
git commit -m "docs: added professional english documentation in README"
git push origin main
