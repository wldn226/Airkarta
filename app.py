import sys
import os
import uvicorn

# Tambahkan folder backend ke path agar import di main.py tidak error
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
