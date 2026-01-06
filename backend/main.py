from fastapi import FastAPI, HTTPException
from backend.pdf_reader import extract_text_from_pdf
import os

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Car Manual & Maintenance Assistant is running 🚗"}

@app.get("/read-manual")
def read_manual(file_name: str):
    file_path = os.path.join("data", file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Manual not found")
    try:
        text = extract_text_from_pdf(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {e}")
    return {"content": text[:1000]}  # Affiche les 1000 premiers caractères
