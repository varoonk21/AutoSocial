<div align="center">
  <img src="frontend/public/Icon.png" alt="AutoSocial Logo" width="80" height="80" />
  <h1>AutoSocial</h1>
  <p><strong>AI-Powered Social Media Scheduling, Multi-Platform Preview & Media Library Platform</strong></p>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/) [![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) [![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/) [![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-Latest-F56565?style=for-the-badge&logo=lucide&logoColor=white)](https://lucide.dev/)

</div>

<br />

---

## 📌 Overview

**AutoSocial** is a modern, high-performance social media management web application designed for creators, agencies, and businesses. Built with a sleek **Meta Business Suite-inspired design**, AutoSocial enables effortless content creation, AI caption generation, multi-platform post previews, media asset management, and scheduled automated publishing across major platforms (Instagram, Facebook, LinkedIn, X/Twitter).

---

## ✨ Key Features

### 🎨 1. Premium & Dynamic UI Design System

- **Meta Business Suite Navigation**: Clean vertical sidebar using `#243746` theme accents, Inter typography, and Lucide React icons.
- **Dynamic Context Header**: Top header automatically updates action buttons depending on the active route (e.g., _Upload Media_ on Media Library, _Save Draft & Publish_ on Create Post).
- **Dark & Light Mode Support**: Seamless one-click dark mode toggle with state persistence.

### ✍️ 2. Multi-Platform Post Creation & Live Preview

- **2-Column Workspace Layout**: Form input controls on the left paired with a real-time live preview container on the right.
- **Multi-Platform Toggles**: Switch instant previews between **Instagram**, **Facebook**, **LinkedIn**, and **X (Twitter)**.
- **Desktop & Mobile Views**: Preview post layouts for both desktop feeds and mobile device viewports.

### 🤖 3. AI-Powered Content Studio

- **Automated Caption & Hashtag Generation**: Generate platform-tailored post text using OpenAI.
- **Tone & Language Controls**: Select tones (Professional, Friendly, Bold, Promotional) and languages.
- **AI Image Generation**: Built-in AI visual asset generator powered by custom prompt engineering.

### 🖼️ 4. Media Library & Digital Asset Management

- **Reference-Grade Grid Layout**: 4-column card grid with file type badges (`IMAGE`, `VIDEO`, `DOCUMENT`), video play overlays, duration tags, and PDF previews.
- **Segmented Filter Pills**: Filter assets instantly by `All Media`, `Images`, `Videos`, `Documents`, `User Uploads`, and `AI Generated`.
- **Quick Hover Actions**: Copy link to clipboard, insert asset directly into Create Post, or delete.
- **Asset Detail Modal**: Full resolution preview, file dimensions, file size, and upload timestamp.

### 📅 5. Post Scheduling & Calendar Management

- Schedule posts for future date and time publishing.
- Status management (Draft, Scheduled, Published).

---

## 🏗️ Project Architecture

AutoSocial is structured as a full-stack monorepo with separated backend and frontend packages:

```
AutoSocial/
├── backend/                  # Node.js & Express API Server
│   ├── config/               # Database connection & env config
│   ├── controllers/          # Auth, Media, Post, & Integration controllers
│   ├── middleware/           # JWT auth & Multer upload middlewares
│   ├── models/               # MongoDB Mongoose schemas (User, Post, Media, Integration)
│   ├── routes/               # Express REST route endpoints
│   ├── services/             # OpenAI & social publishing services
│   └── server.js             # Express app entry point
│
├── frontend/                 # Vite + React Single Page Application
│   ├── public/               # Static assets & AutoSocial brand icon (`/Icon.png`)
│   ├── src/
│   │   ├── api.js            # Axios/Fetch API client wrapper
│   │   ├── components/
│   │   │   ├── layout/       # Sidebar, Dynamic Header, & Shell Layout
│   │   │   ├── pages/        # Landing / Authentication pages
│   │   │   ├── shared/       # Reusable UI icons & badges
│   │   │   └── tabs/         # CreatePost, MediaLibraryPage, Dashboard, etc.
│   │   ├── App.jsx           # React Router route registry
│   │   └── index.css         # Global Tailwind CSS v4 & Inter font setup
│   └── vite.config.js        # Vite dev server configuration
└── README.md
```

---

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Vanilla [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)

### **Backend**

- **Runtime**: [Node.js](https://nodejs.org/) (>= 18)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **AI Integrations**: [OpenAI API](https://platform.openai.com/)

---

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Running locally or a MongoDB Atlas connection string)

---

### 1. Clone the Repository

```bash
git clone https://github.com/varoonk21/AutoSocial.git
cd AutoSocial
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/config/.env` (or `backend/.env`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/autosocial
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=your_openai_api_key_here
```

Start the backend server:

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The backend API will run at `http://localhost:5000`.

---

### 3. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend application will be live at `http://localhost:5173`.

---

## 🔌 API Endpoints Summary

| Method   | Endpoint                    | Description                                   |
| :------- | :-------------------------- | :-------------------------------------------- |
| `POST`   | `/api/auth/register`        | Register a new AutoSocial user account        |
| `POST`   | `/api/auth/login`           | Authenticate user & return JWT token          |
| `GET`    | `/api/media`                | List all uploaded & AI-generated media assets |
| `POST`   | `/api/media/upload`         | Upload media file (Images, Videos, PDFs)      |
| `POST`   | `/api/media/generate-image` | Generate AI image from text prompt            |
| `DELETE` | `/api/media/:id`            | Delete media asset                            |
| `GET`    | `/api/posts`                | Fetch scheduled & published posts             |
| `POST`   | `/api/posts`                | Create or schedule a new post                 |
| `GET`    | `/api/integrations/list`    | List connected social media channels          |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ for social media creators and agencies. Powered by AutoSocial.</sub>
</div>
