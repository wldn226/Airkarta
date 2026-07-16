from pydantic import BaseModel
from typing import Optional


class PrediksiRequest(BaseModel):
    stasiun: str  # contoh: "DKI1 (Bunderan HI)"


class HasilPolutan(BaseModel):
    pm10: float
    pm25: float
    so2: float
    co: float
    o3: float
    no2: float


class Rekomendasi(BaseModel):
    kategori: str
    warna: str
    pesan_umum: str
    aktivitas_luar: str
    masker: str
    kelompok_rentan: str


class PrediksiResponse(BaseModel):
    stasiun: str
    tanggal: str
    cuaca: dict
    polutan_prediksi: HasilPolutan
    kategori: str
    warna: str
    rekomendasi: Rekomendasi
    shap_values: Optional[dict] = None
