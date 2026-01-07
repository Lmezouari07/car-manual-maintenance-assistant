import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Data Configuration
DATA_DIR = os.getenv("DATA_DIR", "data")
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 1000))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 100))

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found. Check your .env file")
