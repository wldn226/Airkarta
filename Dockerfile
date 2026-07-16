FROM python:3.10-slim

WORKDIR /app/backend

# Salin file requirements
COPY backend/requirements.txt .

# Instal dependensi Python
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode backend
COPY backend/ .

# Jalankan server FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
