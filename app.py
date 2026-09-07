import sys
import os
import uvicorn

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

# Dummy function untuk mengelabui ZeroGPU Hugging Face
try:
    import spaces
    import torch
    @spaces.GPU
    def init_gpu():
        pass
    init_gpu()
except Exception as e:
    print("Bypass GPU:", e)

from backend.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
