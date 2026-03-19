# LEXSNIP

<div align="center">
  <img src="https://files.catbox.moe/s88jj1.gif" alt="LEXSNIP Logo" width="100%" />
  <br />
  <p><strong>A modern, IDE-like code sharing workspace powered by AI.</strong></p>

  <br/>

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

---

## About The Project

**LEXSNIP** is a powerful, full-stack alternative to traditional pastebins. Instead of sharing a single flat text file, LEXSNIP provides a **multi-file workspace with good user interface**.

Users can write, organize, and share complete projects using a single link.

It also includes an integrated **AI Assistant powered by Google Gemini**, enabling real-time explanations, debugging, and code insights directly within the shared workspace.

---

## ✨ Key Features

- 🗂️ **Multi-File Workspaces**  
  Create, rename, edit, and organize multiple files in one session.

- 🤖 **Interactive AI Assistant**  
  Ask questions, debug code, and get explanations with context-aware AI.

- 📦 **ZIP Downloads**  
  Download the entire workspace as a `.zip` file instantly.

- 🔗 **One-Click Sharing**  
  Generate a persistent shareable URL for your workspace.

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- PrismJS
- React Simple Code Editor
- JSZip & FileSaver.js
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- Google Generative AI SDK (`@google/generative-ai`)

---

## 🚦 Getting Started

Follow these steps to run the project locally.

---

### 📌 Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas account
- Google AI Studio API Key (Gemini)

---

### ⚙️ Installation & Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/lexsnip.git
cd lexsnip
```

---

### 🔧 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Start the backend:

```bash
npm run dev
# or
node server.js
```

---

### 🎨 Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:

```env
VITE_BACKEND_URL=
```

Start the frontend:

```bash
npm run dev
```

---

## 🌍 Deployment

### 🔹 Backend (Hostinger VPS / Node Hosting)

1. Push backend code to GitHub  
2. Configure CORS in `server.js`:

```js
app.use(cors({
  origin: 'https://your-frontend-domain.vercel.app'
}));
```

3. Deploy on Hostinger:
```bash
npm install -g pm2
pm2 start server.js --name "lexsnip-backend"
```

4. Add environment variables on server:
- MONGO_URI
- GEMINI_API_KEY
- PORT

---

### 🔹 Frontend (Vercel)

1. Push frontend to GitHub  
2. Import project into Vercel  

**Build Settings:**
- Framework: Vite  
- Build Command: npm run build  
- Output Directory: dist  

**Environment Variable:**

```
VITE_BACKEND_URL=https://your-backend-domain.com
```

Click Deploy 🚀

---

## 📂 Project Structure

```
LEXSNIP/
├── backend/
│   ├── models/
│   │   └── Snippet.js
│   ├── .env
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── CreateSnippet.jsx
    │   │   └── SnippetView.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── tailwind.config.js
```

---

## 💡 Usage

1. Open the app in your browser  
2. Use the sidebar to:
   - ➕ Add files  
   - ✏️ Rename files  
   - 📂 Navigate between files  

3. Write code in the live editor  
4. Click **Share Workspace** to generate a URL  
5. Use:
   - ✨ AI Chat → for explanations/debugging  
   - ⬇️ Download ZIP → save project locally  

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo
git checkout -b feature/AmazingFeature
git commit -m "Add AmazingFeature"
git push origin feature/AmazingFeature
```

Then open a Pull Request 

---

## 📜 License

Distributed under the MIT License.  
See LICENSE for more information.
