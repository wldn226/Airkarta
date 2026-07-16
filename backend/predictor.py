import joblib
import numpy as np
import pandas as pd
import requests
import os
import holidays as hol
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# ── Load semua artefak ────────────────────────────────────────────
BASE = os.path.dirname(__file__)

model_reg = {
    p: joblib.load(f"{BASE}/model/lgbm_reg_{p}.pkl")
    for p in ["pm10", "pm25", "so2", "co", "o3", "no2"]
}
model_klf = joblib.load(f"{BASE}/model/lgbm_klasifikasi.pkl")
le_stasiun = joblib.load(f"{BASE}/model/le_stasiun.pkl")
label2idx = joblib.load(f"{BASE}/model/label2idx.pkl")
idx2label = joblib.load(f"{BASE}/model/idx2label.pkl")
fitur_reg = joblib.load(f"{BASE}/model/fitur_regresi.pkl")
fitur_klf = joblib.load(f"{BASE}/model/fitur_klasifikasi.pkl")
fitur_imp_df = joblib.load(f"{BASE}/model/feature_importance.pkl")
top5_fitur = fitur_imp_df.head(5)["fitur"].tolist()

df_historis = pd.read_csv(f"{BASE}/data/bersih/ispu_gabungan_2019_2025.csv")
df_historis["tanggal"] = pd.to_datetime(df_historis["tanggal"])

# ── Rekomendasi kesehatan ─────────────────────────────────────────
REKOMENDASI = {
    "BAIK": {
        "warna": "#2ecc71",
        "pesan_umum": "Kualitas udara baik. Aman untuk semua aktivitas.",
        "aktivitas_luar": "Bebas beraktivitas di luar ruangan.",
        "masker": "Tidak diperlukan.",
        "kelompok_rentan": "Tidak ada risiko khusus.",
    },
    "SEDANG": {
        "warna": "#f1c40f",
        "pesan_umum": "Kualitas udara sedang. Umumnya aman namun perlu perhatian.",
        "aktivitas_luar": "Aktivitas luar ruangan masih aman untuk sebagian besar orang.",
        "masker": "Opsional untuk kelompok sensitif.",
        "kelompok_rentan": "Penderita asma atau alergi sebaiknya membatasi aktivitas berat di luar.",
    },
    "TIDAK SEHAT": {
        "warna": "#e67e22",
        "pesan_umum": "Kualitas udara tidak sehat. Kurangi aktivitas di luar ruangan.",
        "aktivitas_luar": "Hindari aktivitas fisik berat di luar ruangan.",
        "masker": "Disarankan memakai masker N95 atau KN95.",
        "kelompok_rentan": "Anak-anak, lansia, dan penderita penyakit pernapasan wajib mengurangi aktivitas luar.",
    },
    "SANGAT TIDAK SEHAT": {
        "warna": "#e74c3c",
        "pesan_umum": "Kualitas udara sangat tidak sehat. Hindari keluar ruangan.",
        "aktivitas_luar": "Tidak disarankan beraktivitas di luar ruangan.",
        "masker": "Wajib memakai masker N95 atau KN95 jika harus keluar.",
        "kelompok_rentan": "Kelompok rentan DILARANG beraktivitas di luar. Tutup jendela dan gunakan penyaring udara.",
    },
    "BERBAHAYA": {
        "warna": "#8e44ad",
        "pesan_umum": "Kualitas udara berbahaya. Darurat kesehatan.",
        "aktivitas_luar": "DILARANG keluar ruangan.",
        "masker": "Masker N95 wajib, namun tetap di dalam ruangan.",
        "kelompok_rentan": "Semua kelompok berisiko tinggi. Hubungi layanan kesehatan jika mengalami gejala.",
    },
}

# ── Koordinat stasiun ─────────────────────────────────────────────
KOORDINAT_STASIUN = {
    "DKI1 (Bunderan HI)": (-6.1950, 106.8229),
    "DKI2 (Kelapa Gading)": (-6.1583, 106.9075),
    "DKI3 (Jagakarsa)": (-6.3545, 106.8195),
    "DKI4 (Lubang Buaya)": (-6.2617, 106.9425),
    "DKI5 (Kebon Jeruk)": (-6.1922, 106.7638),
}


# ── Ambil cuaca hari ini ──────────────────────────────────────────
def ambil_cuaca(stasiun: str) -> dict:
    lat, lon = KOORDINAT_STASIUN.get(stasiun, (-6.2088, 106.8456))
    api_key = os.getenv("OPENWEATHER_API_KEY")
    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    )
    res = requests.get(url, timeout=10)
    res.raise_for_status()
    data = res.json()
    return {
        "suhu": data["main"]["temp"],
        "kelembaban": data["main"]["humidity"],
        "kecepatan_angin": data["wind"]["speed"] * 3.6,
        "curah_hujan": data.get("rain", {}).get("1h", 0.0),
        "radiasi_matahari": 0.0,
        "deskripsi": data["weather"][0]["description"],
        "ikon": data["weather"][0]["icon"],
    }


# ── Ambil cuaca besok (forecast) ──────────────────────────────────
def ambil_cuaca_besok(stasiun: str) -> dict:
    lat, lon = KOORDINAT_STASIUN.get(stasiun, (-6.2088, 106.8456))
    api_key = os.getenv("OPENWEATHER_API_KEY")
    url = (
        f"https://api.openweathermap.org/data/2.5/forecast"
        f"?lat={lat}&lon={lon}&appid={api_key}&units=metric&cnt=8"
    )
    res = requests.get(url, timeout=10)
    res.raise_for_status()
    data = res.json()
    item = data["list"][3]
    return {
        "suhu": item["main"]["temp"],
        "kelembaban": item["main"]["humidity"],
        "kecepatan_angin": item["wind"]["speed"] * 3.6,
        "curah_hujan": item.get("rain", {}).get("3h", 0.0),
        "radiasi_matahari": 0.0,
        "deskripsi": item["weather"][0]["description"],
        "ikon": item["weather"][0]["icon"],
    }


# ── Bangun fitur ──────────────────────────────────────────────────
def bangun_fitur(stasiun: str, cuaca: dict, tanggal: datetime) -> pd.DataFrame:
    id_holidays = hol.Indonesia(years=range(2019, 2027))
    df_s = df_historis[df_historis["lokasi_spku"] == stasiun].copy()
    df_s = df_s.sort_values("tanggal")

    def lag_val(col, hari):
        idx = df_s[df_s["tanggal"] <= tanggal - timedelta(days=hari)]
        if len(idx) == 0:
            return df_s[col].median() if col in df_s.columns else 0.0
        return float(idx.iloc[-1][col]) if col in idx.columns else 0.0

    def rolling_avg(col, window):
        return float(np.mean([lag_val(col, d) for d in range(1, window + 1)]))

    row = {}

    # Cuaca
    row["suhu"] = cuaca["suhu"]
    row["kelembaban"] = cuaca["kelembaban"]
    row["kecepatan_angin"] = cuaca["kecepatan_angin"]
    row["curah_hujan"] = cuaca["curah_hujan"]
    row["radiasi_matahari"] = cuaca["radiasi_matahari"]

    # Temporal
    row["tahun"] = tanggal.year
    row["bulan"] = tanggal.month
    row["hari"] = tanggal.day
    row["musim"] = (tanggal.month % 12) // 3 + 1
    row["is_pandemi"] = (
        1 if datetime(2020, 3, 1) <= tanggal <= datetime(2022, 6, 30) else 0
    )
    row["is_libur"] = (
        1 if (tanggal.weekday() >= 5 or tanggal.date() in id_holidays) else 0
    )

    # Lag 1,2,3,7,14
    for p in ["pm10", "pm25", "so2", "co", "o3", "no2"]:
        for lag in [1, 2, 3, 7, 14]:
            row[f"{p}_lag{lag}"] = lag_val(p, lag)

    # Rolling average
    for p in ["pm10", "pm25", "o3", "no2"]:
        for w in [3, 7, 14]:
            row[f"{p}_avg{w}"] = rolling_avg(p, w)

    # Volatilitas PM2.5
    row["pm25_std7"] = float(np.std([lag_val("pm25", d) for d in range(1, 8)]))

    # Rata-rata kota
    for p in ["pm10", "pm25", "o3", "no2"]:
        semua = df_historis[df_historis["tanggal"] == tanggal - timedelta(days=1)]
        row[f"{p}_kota_avg"] = (
            float(semua[p].mean()) if len(semua) > 0 else lag_val(p, 1)
        )

    # Stasiun encoding
    row["stasiun_enc"] = le_stasiun.transform([stasiun])[0]

    return pd.DataFrame([row])


# ── Prediksi utama ────────────────────────────────────────────────
def prediksi(stasiun: str, tanggal: datetime, cuaca: dict) -> dict:
    df_fitur = bangun_fitur(stasiun, cuaca, tanggal)

    # Regresi 6 polutan
    hasil_polutan = {}
    for p in ["pm10", "pm25", "so2", "co", "o3", "no2"]:
        val = float(model_reg[p].predict(df_fitur[fitur_reg])[0])
        hasil_polutan[p] = round(max(val, 0), 2)

    # Fitur interaksi untuk klasifikasi
    df_fitur["pm_total"] = hasil_polutan["pm10"] + hasil_polutan["pm25"]
    df_fitur["pm_ratio"] = hasil_polutan["pm25"] / (hasil_polutan["pm10"] + 1e-6)
    df_fitur["nox"] = hasil_polutan["no2"] + hasil_polutan["o3"]
    for p in ["pm10", "pm25", "so2", "co", "o3", "no2"]:
        df_fitur[p] = hasil_polutan[p]

    # Klasifikasi
    idx_pred = int(model_klf.predict(df_fitur[fitur_klf])[0])
    kategori = idx2label[idx_pred]

    # Feature importance (pengganti SHAP)
    fitur_top5 = {
        f: float(fitur_imp_df[fitur_imp_df["fitur"] == f]["importance"].values[0])
        for f in top5_fitur
    }

    rek = REKOMENDASI.get(kategori, REKOMENDASI["SEDANG"])

    return {
        "stasiun": stasiun,
        "tanggal": tanggal.strftime("%Y-%m-%d"),
        "cuaca": cuaca,
        "polutan_prediksi": hasil_polutan,
        "kategori": kategori,
        "warna": rek["warna"],
        "rekomendasi": {
            "kategori": kategori,
            "warna": rek["warna"],
            "pesan_umum": rek["pesan_umum"],
            "aktivitas_luar": rek["aktivitas_luar"],
            "masker": rek["masker"],
            "kelompok_rentan": rek["kelompok_rentan"],
        },
        "shap_values": fitur_top5,
    }
