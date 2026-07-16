from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from schemas import PrediksiRequest
from predictor import ambil_cuaca, prediksi, KOORDINAT_STASIUN
from predictor import ambil_cuaca, ambil_cuaca_besok, prediksi, KOORDINAT_STASIUN
import pandas as pd

app = FastAPI(title="API Kualitas Udara DKI Jakarta", version="1.0")

import os
from dotenv import load_dotenv

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Endpoint 1: Daftar stasiun
@app.get("/stasiun")
def get_stasiun():
    return {"stasiun": list(KOORDINAT_STASIUN.keys())}


# Endpoint 2: Prediksi hari ini
@app.post("/prediksi/hari-ini")
def prediksi_hari_ini(req: PrediksiRequest):
    try:
        cuaca = ambil_cuaca(req.stasiun)
        hasil = prediksi(req.stasiun, datetime.today(), cuaca)
        return hasil
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 3: Prediksi besok
@app.post("/prediksi/besok")
def prediksi_besok(req: PrediksiRequest):
    try:
        cuaca = ambil_cuaca_besok(req.stasiun)  # ← pakai forecast
        besok = datetime.today() + timedelta(days=1)
        hasil = prediksi(req.stasiun, besok, cuaca)
        return hasil
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 4: Data historis stasiun
@app.get("/historis/{stasiun_enc}")
def get_historis(stasiun_enc: str):
    try:
        from predictor import df_historis, le_stasiun

        nama = le_stasiun.inverse_transform([int(stasiun_enc)])[0]
        df_s = df_historis[df_historis["lokasi_spku"] == nama].copy()
        df_s = df_s.sort_values("tanggal").tail(90)  # 90 hari terakhir
        return df_s[
            ["tanggal", "kategori", "pm10", "pm25", "so2", "co", "o3", "no2"]
        ].to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 5: Health check
@app.get("/")
def root():
    return {"status": "ok", "message": "API Kualitas Udara DKI Jakarta"}
