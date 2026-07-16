import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import iconHumidity from "../assets/kelembapan.svg";
import iconWind from "../assets/udara.svg";
import iconTemp from "../assets/suhu.svg";
import iconRainy from "../assets/curah hujan.svg";

const POLUTAN_INFO = {
  pm10: { label: "PM10", satuan: "µg/m³", desc: "Partikel kasar" },
  pm25: { label: "PM2.5", satuan: "µg/m³", desc: "Partikel halus" },
  so2: { label: "SO₂", satuan: "µg/m³", desc: "Sulfur dioksida" },
  co: { label: "CO", satuan: "µg/m³", desc: "Karbon monoksida" },
  o3: { label: "O₃", satuan: "µg/m³", desc: "Ozon" },
  no2: { label: "NO₂", satuan: "µg/m³", desc: "Nitrogen dioksida" },
};

const KATEGORI_COLOR = {
  BAIK: "#16a34a", // Green
  SEDANG: "#0ea5e9", // Blue
  "TIDAK SEHAT": "#f97316", // Orange
  "SANGAT TIDAK SEHAT": "#ef4444", // Red
  BERBAHAYA: "#a855f7", // Purple
};

const URUTAN = [
  "BAIK",
  "SEDANG",
  "TIDAK SEHAT",
  "SANGAT TIDAK SEHAT",
  "BERBAHAYA",
];

export default function HasilPrediksi({ data, label, mapComponent }) {
  const { kategori, warna, polutan_prediksi, rekomendasi, cuaca, shap_values } =
    data;
  const color = KATEGORI_COLOR[kategori] || "#94a3b8";

  return (
    <div className="hasil-card-figma">
      {/* 1. Status Utama */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h2
          className="info-title-figma"
          style={{ color: "#3b82f6", marginBottom: 0 }}
        >
          Udara Jakarta Hari ini
        </h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {URUTAN.map((k) => (
            <div
              key={`legend-${k}`}
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: KATEGORI_COLOR[k],
                borderRadius: "4px",
                border: "1px solid #94a3b8",
              }}
            ></div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #60a5fa",
            borderRadius: "8px",
            padding: "1rem",
            flex: "1 1 300px",
            maxWidth: "350px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: color,
              border: "2px solid white",
              boxShadow: "0 0 0 1px #3b82f6",
              marginRight: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          ></div>
          <div>
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--text-color)",
                fontWeight: 600,
              }}
            >
              Kualitas Udara
            </div>
            <div style={{ fontSize: "1.2rem", color, fontWeight: 700 }}>
              {kategori}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {URUTAN.map((k) => {
            const isActive = k === kategori;
            return (
              <div
                key={`box-${k}`}
                style={{
                  width: "30px",
                  height: "50px",
                  border: isActive ? "none" : "1px solid #94a3b8",
                  backgroundColor: isActive ? KATEGORI_COLOR[k] : "transparent",
                  borderRadius: "4px",
                }}
              ></div>
            );
          })}
        </div>
      </div>

      {/* 2. Peta */}
      {mapComponent && (
        <div className="info-section-figma mt-8">
          <h2 className="info-title-figma" style={{ color: "#3b82f6" }}>
            Lokasi Stasiun
          </h2>
          <div className="map-container-figma">{mapComponent}</div>
        </div>
      )}

      {/* 3. Cuaca */}
      {cuaca && (
        <div className="info-section-figma mt-8">
          <h2 className="info-title-figma" style={{ color: "#3b82f6" }}>
            Kondisi Cuaca
          </h2>
          <div className="cuaca-grid-figma">
            <div
              className="cuaca-card-figma"
              style={{
                backgroundColor: "#fca5a5",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "1rem",
                borderRadius: "12px",
              }}
            >
              <img
                src={iconTemp}
                alt="Suhu"
                style={{ width: "40px", height: "40px", marginRight: "1rem" }}
              />
              <div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-color)",
                    fontWeight: 600,
                  }}
                >
                  Suhu
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    color: "var(--text-color)",
                    fontWeight: 700,
                  }}
                >
                  {cuaca.suhu?.toFixed(1)}°C
                </div>
              </div>
            </div>

            <div
              className="cuaca-card-figma"
              style={{
                backgroundColor: "#7dd3fc",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "1rem",
                borderRadius: "12px",
              }}
            >
              <img
                src={iconHumidity}
                alt="Kelembapan"
                style={{ width: "40px", height: "40px", marginRight: "1rem" }}
              />
              <div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-color)",
                    fontWeight: 600,
                  }}
                >
                  Kelembapan
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    color: "var(--text-color)",
                    fontWeight: 700,
                  }}
                >
                  {cuaca.kelembaban}%
                </div>
              </div>
            </div>

            <div
              className="cuaca-card-figma"
              style={{
                backgroundColor: "#6ee7b7",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "1rem",
                borderRadius: "12px",
              }}
            >
              <img
                src={iconWind}
                alt="Angin"
                style={{ width: "40px", height: "40px", marginRight: "1rem" }}
              />
              <div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-color)",
                    fontWeight: 600,
                  }}
                >
                  Angin km/h
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    color: "var(--text-color)",
                    fontWeight: 700,
                  }}
                >
                  {cuaca.kecepatan_angin?.toFixed(1)}
                </div>
              </div>
            </div>

            <div
              className="cuaca-card-figma"
              style={{
                backgroundColor: "#93c5fd",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "1rem",
                borderRadius: "12px",
              }}
            >
              <img
                src={iconRainy}
                alt="Hujan"
                style={{ width: "40px", height: "40px", marginRight: "1rem" }}
              />
              <div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-color)",
                    fontWeight: 600,
                  }}
                >
                  Hujan mm
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    color: "var(--text-color)",
                    fontWeight: 700,
                  }}
                >
                  {cuaca.curah_hujan}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Polutan */}
      <div className="info-section-figma mt-8">
        <h2 className="info-title-figma">Prediksi Konsentrasi Polutan</h2>
        <div className="polutan-prediksi-grid-figma">
          {Object.entries(polutan_prediksi).map(([key, val]) => {
            const info = POLUTAN_INFO[key];
            return (
              <div key={key} className="pol-pred-card">
                <div className="pp-header">
                  <span className="pp-name">{info?.label ?? key}</span>
                </div>
                <div className="pp-body">
                  <span className="pp-val">{val}</span>
                  <span className="pp-sat">{info?.satuan}</span>
                </div>
                <div className="pp-desc">{info?.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Rekomendasi Kesehatan */}
      {rekomendasi && (
        <div className="info-section-figma mt-8">
          <h2 className="info-title-figma">Rekomendasi Kesehatan</h2>
          <div className="rek-box-figma">
            {[
              rekomendasi.pesan_umum,
              rekomendasi.aktivitas_luar,
              rekomendasi.masker,
              rekomendasi.kelompok_rentan,
            ]
              .filter(Boolean)
              .map((teks, i) => (
                <div key={i} className="rek-item-figma">
                  {teks}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 6. Fitur Paling Berpengaruh */}
      {shap_values && Object.keys(shap_values).length > 0 && (
        <div className="info-section-figma mt-8">
          <h2 className="info-title-figma">Udara Jakarta Hari ini</h2>
          <div className="shap-subtitle-figma">FITUR PALING BERPENGARUH</div>
          <div
            className="shap-chart-container"
            style={{ width: "100%", height: 350, marginTop: "1rem" }}
          >
            <ResponsiveContainer>
              <BarChart
                data={Object.entries(shap_values)
                  .map(([k, v]) => ({ name: k, value: Math.abs(v) }))
                  .sort((a, b) => b.value - a.value)}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 60, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 14, fontWeight: 700 }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: "rgba(128,128,128,0.1)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-main)",
                  }}
                  itemStyle={{ color: "var(--text-main)" }}
                  formatter={(value) => [value.toFixed(2), "Dampak"]}
                />
                <Bar
                  dataKey="value"
                  fill="#0ea5e9"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                >
                  {Object.entries(shap_values).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#0ea5e9" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
