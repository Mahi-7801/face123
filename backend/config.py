import os
from dotenv import load_dotenv

load_dotenv()

# Supabase PostgreSQL connection
# Get connection string from: Supabase Dashboard -> Settings -> Database -> Connection string -> URI
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Supabase REST API (optional, for future use)
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://drcatwyjmkyiqiochbed.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyY2F0d3lqbWt5aXFpb2NoYmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzM0NDYsImV4cCI6MjA5ODU0OTQ0Nn0.3bHOnZtm4EjQ4BF9aW5cLC_pt7iPTPFDg2kkUsmFecg")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyY2F0d3lqbWt5aXFpb2NoYmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk3MzQ0NiwiZXhwIjoyMDk4NTQ5NDQ2fQ.Q8aQnjL7pfdmrnwGVkAZsY8tR3_NuM5FfGjuN-cQHs0")

JWT_SECRET = os.getenv("JWT_SECRET", "face-attendance-jwt-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, os.getenv("UPLOAD_DIR", "uploads"))
ENCODING_DIR = os.path.join(BASE_DIR, os.getenv("ENCODING_DIR", "encodings"))

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

FACE_CONFIDENCE_THRESHOLD = float(os.getenv("FACE_CONFIDENCE_THRESHOLD", "0.55"))
MAX_IMAGE_SIZE_MB = int(os.getenv("MAX_IMAGE_SIZE_MB", "10"))

# SMTP Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "")
EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "FaceTrack Attendance System")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ENCODING_DIR, exist_ok=True)
