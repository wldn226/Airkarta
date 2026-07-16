FROM python:3.10-slim

WORKDIR /app/backend

# Salin file requirements
COPY backend/requirements.txt .

# Instal dependensi sistem untuk LightGBM
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 && rm -rf /var/lib/apt/lists/*

# Instal dependensi Python
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode backend
COPY backend/ .

# Jalankan server FastAPI dengan membaca variabel PORT (wajib untuk Railway)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}
