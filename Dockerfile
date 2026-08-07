# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Build FastAPI + ML Environment
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for OpenCV / ONNX
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend_fastapi/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and ML models
COPY backend_fastapi/ .

# Copy built frontend static files from Stage 1 into FastAPI static directory
COPY --from=frontend-builder /app/frontend/dist /app/static

# Hugging Face Spaces defaults to port 7860
EXPOSE 7860

# Run Uvicorn on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]