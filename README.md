# IntelliStudy – AI-Powered Learning Assistant

**Learn Differently. Understand Everything.**

IntelliStudy is an AI-powered learning assistant designed to help students understand complex concepts, interact with study materials, and improve their learning experience using Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and AI-based answer verification.

The project combines a modern web interface with a Python-based backend powered by FastAPI and Ollama.

## ✨ Features

- **AI-Powered Question Answering:** Get clear and easy-to-understand answers using Llama 3.2.
- **Retrieval-Augmented Generation (RAG):** Generate document-aware responses using relevant information retrieved from study materials.
- **Answer Verification:** Evaluate answer claims as Supported, Contradicted, or Insufficient Evidence.
- **Interactive Chat Interface:** Ask questions and interact with the AI assistant.
- **Chat History:** Create multiple study sessions and retain conversations using browser local storage.
- **Modern UI:** Clean, responsive, and user-friendly interface.
- **Learning Toolkit:** Includes concept decoder, note architect, quiz arena, and evidence lens interface.

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Local Storage

### Backend
- Python
- FastAPI
- Ollama
- Llama 3.2 (3B)

### AI and Machine Learning
- Retrieval-Augmented Generation (RAG)
- Sentence Transformers
- FAISS
- all-MiniLM-L6-v2
- Answer Verification using LLMs

### Other Tools
- Visual Studio Code
- Git and GitHub
- Uvicorn
- PyMuPDF

## 📁 Project Structure

```text
IntelliStudy/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── api.py
│   ├── llm.py
│   ├── rag.py
│   ├── verification.py
│   └── requirements.txt
│
├── README.md
└── .gitignore
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/intellistudy-ai-learning-assistant.git
```

```bash
cd intellistudy-ai-learning-assistant
```

### 2. Install Python Dependencies

Navigate to the backend directory:

```bash
cd backend
```

Install the required packages:

```bash
pip install -r requirements.txt
```

### 3. Install and Run Ollama

Download Ollama from:

https://ollama.com/

Pull the required model:

```bash
ollama pull llama3.2:3b
```

Make sure Ollama is running.

### 4. Start the Backend Server

Run the following command inside the backend directory:

```bash
uvicorn api:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Run the Frontend

Open the frontend folder in Visual Studio Code.

Use the **Live Server** extension to launch:

```text
http://127.0.0.1:5500
```

Make sure the backend is running before asking questions.

## 🧠 System Architecture

```text
             User
              |
              v
       Frontend Interface
        HTML, CSS, JS
              |
              v
          FastAPI
           api.py
              |
       +------+------+
       |             |
       v             v
   LLM Module     Verification
    llm.py       verification.py
       |             |
       v             v
   Ollama /       Claim Analysis
   Llama 3.2
       |
       v
   AI Generated Answer
       |
       v
    Frontend
```

The RAG module uses Sentence Transformers to generate embeddings and FAISS for similarity-based retrieval of relevant text chunks.

## 🔍 API Endpoint

### POST `/ask`

Accepts a question and optional document context.

**Request:**

```json
{
  "question": "What is Artificial Intelligence?",
  "context": ""
}
```

**Response:**

```json
{
  "question": "What is Artificial Intelligence?",
  "answer": "Artificial Intelligence is...",
  "verification": {
    "claims": []
  }
}
```

## 🚀 Future Enhancements

- Complete PDF upload and document processing integration.
- Connect FAISS-based retrieval directly to the API.
- Image understanding and multimodal question answering.
- Automatic generation of revision notes.
- AI-generated quizzes and practice questions.
- Improved evidence-based answer verification.
- Enhanced document management and knowledge vault.

## 🎯 Project Objective

The primary objective of IntelliStudy is to make learning more interactive, accessible, and effective by combining Generative AI, document-based knowledge retrieval, and answer verification into a unified learning platform.

---

⭐ If you find this project interesting, consider giving it a star!

**IntelliStudy – Think Freely. Learn Deeply.**
