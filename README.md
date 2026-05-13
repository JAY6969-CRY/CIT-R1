# Argument Archaeologist 🌀

> Paste a WhatsApp chat export → get a forensic AI-powered relationship analysis with interactive visualizations.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)
![OpenAI](https://img.shields.io/badge/GPT--4o-OpenAI-412991?style=flat-square&logo=openai&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2-8884d8?style=flat-square)

---

## 🧐 What It Does

Argument Archaeologist takes a raw WhatsApp group chat export and runs it through GPT-4o to produce a **forensic relationship breakdown** — identifying the turning point of the argument, assigning roles to each participant (Instigator, Peacemaker, etc.), plotting a tension timeline, and delivering an overall relationship summary.

---

## 🚀 Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OpenAI API key
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:8000`.

---

## 📱 How to Export a WhatsApp Chat

1. Open WhatsApp on your phone
2. Go to the group or chat you want to analyze
3. Tap **⋮ More** (Android) or the group name (iOS)
4. Select **Export chat**
5. Choose **Without Media**
6. Copy or share the `.txt` file contents

---

## 📸 Live Demo

> 🔗 [Live Demo — Coming Soon](#)

---

## 🛠 Tech Stack

| Layer     | Tech                      |
|-----------|---------------------------|
| Frontend  | React 18, Vite 5, Recharts |
| Backend   | FastAPI, Uvicorn          |
| AI        | OpenAI GPT-4o             |
| HTTP      | Axios                     |
| Styling   | Vanilla CSS (dark theme)  |

---

## 📂 Project Structure

```
argument-archaeologist/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

Made with ☕ and questionable group chat history.
