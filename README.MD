# DrawCal 

A web-based drawing and calculation application that combines canvas-based drawing with computational capabilities.

## Setup
1. Clone the repository
2. Run `npm install`
3. Configure environment variables in `.env`
4. Run `npm start` to launch the application

## Features
- Interactive drawing canvas
- Real-time calculations
- User authentication
- Feedback system

## Tech Stack
- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js
- Database: Firebase
- ML: Local LLama model

{
  "name": "drawcal-2",
  "version": "1.0.0",
  "description": "Drawing and calculation application",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js"
  },
  "author": "",
  "license": "ISC"
}

# Project Structure


    DrawCal 2/
    ├── frontend/
    │   ├── scripts/
    │   │    ├── app.js
    │   │    ├── auth.js
    │   │    ├── canvas.js
    │   │    ├── canvasBoard.js
    │   │    ├── app.js
    │   │    ├── auth.js
    │   │    ├── canvas.js
    │   │    ├── canvasBoard.js
    │   │    ├── HistoryContainer.js
    │   │    ├── canvas.js
    │   │    ├── navbar.js
    │   │    ├── authButton.js
    │   │    └── feedbackHandler.js
    │   ├── styles/
    │   │   ├── answer-container.css
    │   │   ├── canvas.css
    │   │   ├── index.css
    │   │   ├── layout.css
    │   │   ├── main.css
    │   │   ├── navbar.css
    │   │   ├── style.css      
    │   │   └── footer.css
    │   ├── index.html
    │   ├── about.html
    │   ├── dashboard.html
    │   └── feedback.html
    ├── backend/
    │   ├── config/
    │   │   └── firebaseConfig.js
    │   ├── routes/
    │   │   ├── apiRoutes.js
    │   │   └── api.js
    │   ├── services/
    │   │   ├── authService.js
    │   │   ├── langchainService.js
    │   │   ├── llamaIntegration.js
    │   │   ├── llamaService.js
    │   │   ├── ollamaService.js
    │   │   ├── firebaseService.js
    │   │   └── localLlamaService.js
    │   ├── data/
    │   │   └── feedback.txt
    │   ├── controllers/  
    │   │   └── aiController.js
    │   ├── package-lock.json│
    │   ├── package.json
    │   ├── server.js/      
    │   └── .en
    └── README.md
```
