# ====================================================================
#  Hugging Face Space Dockerfile at ROOT for FastAPI Backend
# ====================================================================

FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOME=/home/user

# Create non-root user for Hugging Face Spaces compatibility
RUN useradd -m -u 1000 user
WORKDIR /app

# Install system dependencies required for InsightFace and OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary local directories and set owner permissions
RUN mkdir -p /home/user/.insightface/models && \
    mkdir -p /app/uploads && \
    mkdir -p /app/encodings && \
    chown -R user:user /app /home/user

# Switch to the non-root user
USER user

# Copy the backend code
COPY --chown=user:user backend/ .

# Expose the API port
EXPOSE 8000

# Start FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
