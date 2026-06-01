import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@db:5432/inventory_db",
)

# Fix for Render's postgres:// vs postgresql:// scheme
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
