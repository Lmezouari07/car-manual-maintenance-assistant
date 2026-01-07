from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from pypdf import PdfReader
import os
import shutil

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Car Manual & Maintenance Assistant",
    description="AI-powered assistant for car manuals and maintenance",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

if not OPENAI_API_KEY:
    print("⚠️  Warning: OPENAI_API_KEY not found. Chat functionality will not work.")
    client = None
else:
    client = OpenAI(api_key=OPENAI_API_KEY)

# Store manual text in memory (for demo - use vector DB in production)
manual_store = {}


# Helper functions
def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF file"""
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """Split text into chunks with overlap"""
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap

    return chunks


# Pydantic models
class QuestionRequest(BaseModel):
    question: str
    manual_name: str | None = None


class ChatResponse(BaseModel):
    answer: str
    source: str | None = None


# Routes
@app.get("/")
def read_root():
    return {"message": "Car Manual & Maintenance Assistant is running 🚗"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "api_key_configured": bool(OPENAI_API_KEY)}


@app.get("/manuals")
def list_manuals():
    """List all uploaded manuals"""
    data_dir = "data"
    if not os.path.exists(data_dir):
        return {"manuals": []}
    
    manuals = [f for f in os.listdir(data_dir) if f.endswith(".pdf")]
    return {"manuals": manuals}


@app.post("/upload")
async def upload_manual(file: UploadFile = File(...)):
    """Upload a car manual PDF"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Save file
    data_dir = "data"
    os.makedirs(data_dir, exist_ok=True)
    file_path = os.path.join(data_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract and store text
    try:
        text = extract_text_from_pdf(file_path)
        chunks = chunk_text(text, chunk_size=1000, overlap=100)
        manual_store[file.filename] = {
            "text": text,
            "chunks": chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {e}")
    
    return {
        "message": "Manual uploaded successfully",
        "filename": file.filename,
        "pages_extracted": len(chunks)
    }


@app.get("/read-manual")
def read_manual(file_name: str):
    """Extract text from a manual"""
    file_path = os.path.join("data", file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Manual not found")
    try:
        text = extract_text_from_pdf(file_path)
        return {"content": text[:2000], "total_length": len(text)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {e}")


@app.post("/ask", response_model=ChatResponse)
async def ask_question(request: QuestionRequest):
    """Ask a question about the car manual"""
    
    if not client:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    # Get manual context
    context = ""
    manual_name = request.manual_name
    
    if manual_name and manual_name in manual_store:
        context = manual_store[manual_name]["text"][:4000]
    else:
        # Use first available manual
        data_dir = "data"
        if os.path.exists(data_dir):
            manuals = [f for f in os.listdir(data_dir) if f.endswith(".pdf")]
            if manuals:
                file_path = os.path.join(data_dir, manuals[0])
                context = extract_text_from_pdf(file_path)[:4000]
                manual_name = manuals[0]
    
    if not context:
        raise HTTPException(status_code=400, detail="No manual available. Please upload a manual first.")
    
    # Call OpenAI
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """You are a helpful car maintenance assistant. 
                    Answer questions based on the car manual provided. 
                    Be precise and helpful. If the information is not in the manual, say so.
                    Provide step-by-step instructions when relevant."""
                },
                {
                    "role": "user",
                    "content": f"""Based on this car manual excerpt:
                    
{context}

Question: {request.question}

Please provide a helpful answer based on the manual."""
                }
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        answer = response.choices[0].message.content
        return ChatResponse(answer=answer, source=manual_name)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {e}")


@app.delete("/manuals/{filename}")
def delete_manual(filename: str):
    """Delete a manual"""
    file_path = os.path.join("data", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Manual not found")
    
    os.remove(file_path)
    if filename in manual_store:
        del manual_store[filename]
    
    return {"message": f"Manual {filename} deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
