# 📖 MEAN Bible

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Angular](https://img.shields.io/badge/Angular-Frontend-red)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Express](https://img.shields.io/badge/Express-API-black)
![License](https://img.shields.io/badge/License-MIT-blue)

A full-stack **Bible application** built using the **MEAN stack
(MongoDB, Express, Angular, Node.js)**.\
It provides a structured Bible API with search capabilities and a
frontend interface for browsing scripture.

------------------------------------------------------------------------

# 🚀 Features

-   📚 Browse Bible books, chapters, and verses\
-   🔍 Search verses by keyword\
-   ⚡ RESTful API built with Express\
-   🌐 Angular frontend UI\
-   🗄️ MongoDB-based structured data\
-   🔗 Relational-like references (Books → Chapters → Verses)

------------------------------------------------------------------------

# 🧠 Architecture

## System Overview

    Angular Frontend → Node.js + Express API → MongoDB Database

------------------------------------------------------------------------

## Request Flow

User → Angular App → Express API → MongoDB → Express → Angular → User

------------------------------------------------------------------------

# 🏗️ Tech Stack

-   **Frontend:** Angular\
-   **Backend:** Node.js, Express\
-   **Database:** MongoDB\
-   **API Style:** REST

------------------------------------------------------------------------

# 📁 Project Structure

    MEAN-Bible/
    │
    ├── api-bible/
    ├── angular-bible/
    └── README.md

------------------------------------------------------------------------

# ⚙️ Installation

## 1. Clone Repository

git clone https://github.com/Kryuzaki18/MEAN-Bible.git cd MEAN-Bible

------------------------------------------------------------------------

## 2. Backend Setup

cd api-bible npm install

Create `.env` file:

PORT=7777 MONGO_URI=your_mongodb_connection_string

------------------------------------------------------------------------

## 3. Frontend Setup

cd angular-bible npm install

------------------------------------------------------------------------

# ▶️ Running the Application

## Start API

cd api-bible npm run start

API runs at: http://localhost:7777

------------------------------------------------------------------------

## Start Frontend

cd angular-bible ng serve

Frontend runs at: http://localhost:4200

------------------------------------------------------------------------

# 📡 API Overview

## Books

GET /api/books GET /api/books/:id

## Chapters

GET /api/books/:bookId/chapters

## Verses

GET /api/verses?book=John&chapter=3 GET /api/verses/search?q=love GET

------------------------------------------------------------------------

# 🔐 Environment Variables

PORT - Backend server port\
MONGO_URI - MongoDB connection string

------------------------------------------------------------------------

# 🚀 Deployment

Backend: Fly.io, Render, Railway, Cloud Run\
Frontend: Vercel, Netlify\
Database: MongoDB Atlas

------------------------------------------------------------------------

# 📌 Future Improvements

-   Authentication\
-   Multi-version support\

------------------------------------------------------------------------

# 📄 License

MIT License
