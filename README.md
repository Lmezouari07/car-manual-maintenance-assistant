# 🚗 Car Manual & Maintenance Assistant

An AI-powered assistant that helps car owners understand their vehicle manuals, track maintenance schedules, and receive intelligent service reminders using RAG (Retrieval-Augmented Generation) technology.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- **PDF Manual Upload** — Upload and process car owner manuals via drag & drop
- **Smart Q&A** — Ask questions about your car and get accurate answers from the manual
- **RAG Pipeline** — Uses embeddings and vector search for precise information retrieval
- **Modern UI** — Dark-themed, responsive chat interface
- **Real-time Chat** — Interactive conversation with typing indicators

## 🖼️ Screenshots

*Coming soon*

## 🛠️ Tech Stack

**Backend:**
- FastAPI
- Python 3.10+
- OpenAI GPT-4o-mini
- pypdf for PDF processing

**Frontend:**
- HTML5 / CSS3
- Vanilla JavaScript
- Font Awesome Icons

**RAG (Coming Soon):**
- LangChain
- ChromaDB

## 📋 Prerequisites

- Python 3.10 or higher
- OpenAI API Key
- Git
- Modern web browser

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/car-manual-maintenance-assistant.git
cd car-manual-maintenance-assistant
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

## ▶️ Running the Application

### Start the Backend Server

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Open the Frontend

Open `frontend/index.html` in your browser, or serve it with:

```bash
# Using Python's built-in server
cd frontend
python -m http.server 3000
```

Then visit: `http://localhost:3000`

### Quick Start (Both)

```bash
# Terminal 1 - Backend
uvicorn backend.main:app --reload

# Terminal 2 - Frontend
cd frontend && python -m http.server 3000
```

## 📁 Project Structure

```
car-manual-maintenance-assistant/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application & endpoints
│   ├── config.py            # Configuration & env variables
│   ├── pdf_reader.py        # PDF text extraction
│   └── rag/
│       └── chunker.py       # Text chunking for RAG
├── frontend/
│   ├── index.html           # Main HTML page
│   ├── styles.css           # Styling
│   └── app.js               # Frontend JavaScript
├── data/                    # Car manuals (PDF) - gitignored
│   └── .gitkeep
├── .env.example             # Environment variables template
├── .gitignore
├── requirements.txt
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check message |
| `GET` | `/health` | API health & config status |
| `GET` | `/manuals` | List all uploaded manuals |
| `POST` | `/upload` | Upload a car manual (PDF) |
| `GET` | `/read-manual?file_name=` | Extract text from PDF |
| `POST` | `/ask` | Ask a question about the manual |
| `DELETE` | `/manuals/{filename}` | Delete a manual |

### API Documentation

Once running, access the interactive API docs:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 🧪 Example Usage

### Using cURL

```bash
# Health check
curl http://localhost:8000/

# List manuals
curl http://localhost:8000/manuals

# Upload a manual
curl -X POST -F "file=@your-manual.pdf" http://localhost:8000/upload

# Ask a question
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I change the oil?", "manual_name": "your-manual.pdf"}'
```

### Using the Frontend

1. Open the app in your browser
2. Drag & drop your car manual PDF (or click to browse)
3. Wait for upload to complete
4. Start asking questions in the chat!

## 🔧 Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | *required* |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o-mini` |
| `EMBEDDING_MODEL` | Embedding model | `text-embedding-3-small` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `DEBUG` | Debug mode | `True` |

## 📝 Status

🚧 **Project under active development**

### Roadmap
- [x] PDF text extraction
- [x] Text chunking
- [x] Basic chat endpoint
- [x] Frontend UI with chat interface
- [x] File upload functionality
- [ ] Embeddings generation with OpenAI
- [ ] Vector store integration (ChromaDB)
- [ ] RAG-powered responses
- [ ] Maintenance scheduling
- [ ] Service reminders

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Baha Eddine Mlouk** — AI Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/YOUR_LINKEDIN)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/YOUR_USERNAME)

---

⭐ Star this repo if you find it useful!
