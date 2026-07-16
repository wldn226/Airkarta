FROM python:3.10-slim

WORKDIR /app

# Salin folder backend ke dalam container
COPY backend/requirements.txt .

# Instal dependensi Python
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode backend
COPY backend/ ./backend/

# Jalankan server FastAPI di port 7860 (Standar Hugging Face)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
