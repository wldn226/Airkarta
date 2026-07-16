import { useState, useEffect } from "react";
import axios from "axios";
import iconSun from "./assets/light_mode.svg";
import iconMoon from "./assets/nightmode.svg";
import iconHumidity from "./assets/kelembapan.svg";
import iconWind from "./assets/udara.svg";
import iconTemp from "./assets/suhu.svg";
import iconRainy from "./assets/curah hujan.svg";
import logoAirkarta from "./assets/AIRKARTA.svg";
import imgHero from "./assets/image 3.svg";
import imgIspuBoard from "./assets/Rectangle 55.svg";
import StasiunDropdown from "./components/StasiunDropdown";
import HasilPrediksi from "./components/HasilPrediksi";
import FooterApp from "./components/FooterApp";
import JakartaMapLeaflet from "./components/JakartaMapLeaflet";
import "./App.css";
import "./FigmaStyle.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );
  const [aktivMenu, setAktivMenu] = useState(
    () => localStorage.getItem("aktivMenu") || "beranda",
  );
  const [stasiun, setStasiun] = useState([]);
  const [pilihan, setPilihan] = useState("");
  const [hariIni, setHariIni] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("aktivMenu", aktivMenu);
  }, [aktivMenu]);

  useEffect(() => {
    if (aktivMenu === "beranda") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.1 },
      );

      const elements = document.querySelectorAll(".fade-in-section");
      elements.forEach((el) => observer.observe(el));

      return () => {
        elements.forEach((el) => observer.unobserve(el));
      };
    }
  }, [aktivMenu]);

  useEffect(() => {
    axios
      .get(`${API}/stasiun`)
      .then((r) => setStasiun(r.data.stasiun))
      .catch(() => setError("Gagal memuat daftar stasiun."));
  }, []);

  const handlePrediksi = async () => {
    if (!pilihan) return;
    setLoading(true);
    setError("");
    setAktivMenu("prediksi");
    try {
      const r1 = await axios.post(`${API}/prediksi/hari-ini`, {
        stasiun: pilihan,
      });
      setHariIni(r1.data);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Gagal mengambil data. Pastikan backend berjalan di http://localhost:8000";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="app">
      {/* ── NAVBAR ─────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div
            className="brand-logo-text"
            style={{
              fontFamily: '"IBM Plex Sans JP", sans-serif',
              fontWeight: 700,
              fontSize: "1.5rem",
              letterSpacing: "1px",
              cursor: "pointer",
            }}
            onClick={() => setAktivMenu("beranda")}
          >
            <span style={{ color: "#3b82f6" }}>AIR</span>
            <span style={{ color: "var(--text-color)" }}>KARTA</span>
          </div>
        </div>

        <div className="navbar-right">
          {aktivMenu === "prediksi" && (
            <button
              onClick={() => setAktivMenu("beranda")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-color)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Beranda
            </button>
          )}
          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="theme-toggle-icon">
              {theme === "dark" ? (
                <img src={iconSun} alt="Light Mode" width="20" height="20" />
              ) : (
                <img src={iconMoon} alt="Dark Mode" width="20" height="20" />
              )}
            </span>
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════
          HALAMAN DASHBOARD
          ════════════════════════════════════════════ */}
      {aktivMenu === "beranda" && (
        <div className="page-wrap dashboard-page">
          {/* ── Hero ── */}
          <section className="hero-figma fade-in-section">
            <div className="hero-bg-wrapper">
              <img
                src={imgHero}
                alt="Jakarta Skyline"
                className="hero-bg-img"
              />
            </div>
            <div className="hero-content-figma">
              <h1 className="hero-title-figma">
                Bagaimana Udara Jakarta
                <br />
                Hari Ini?
              </h1>
              <p className="hero-sub-figma">
                Panduan lengkap mengenai parameter kualitas udara, kategori
                bahaya, dan langkah-langkah kesehatan yang perlu Anda ambil
                untuk melindungi diri dan keluarga di Jakarta.
              </p>
              <button
                className="btn-primary-figma"
                onClick={() => setAktivMenu("prediksi")}
              >
                Coba Prediksi
              </button>
            </div>
          </section>

          {/* ── Panduan ISPU ── */}
          <section className="tentang-section" id="panduan-ispu">
            <div className="tentang-section-figma fade-in-section">
              <div className="ispu-info-figma">
                <div className="ispu-info-left">
                  <img
                    src={imgIspuBoard}
                    alt="Papan ISPU"
                    className="ispu-board-img"
                  />
                </div>
                <div className="ispu-info-right">
                  <h3>
                    Apa itu <span className="text-blue">ISPU?</span>
                  </h3>
                  <p>
                    Indeks Standar Pencemar Udara (ISPU) merupakan angka tanpa
                    satuan, digunakan untuk menggambarkan kondisi mutu udara
                    ambien di lokasi tertentu dan didasarkan kepada dampak
                    terhadap kesehatan manusia, nilai estetika dan makhluk hidup
                    lainnya.
                  </p>
                  <p>
                    Pemerintah Provinsi DKI Jakarta melalui Dinas Lingkungan
                    Hidup memantau nilai ISPU secara berkala. Angka ini dihitung
                    berdasarkan parameter utama seperti Partikulat (PM10,dan
                    PM2.5), Karbon Monoksida (CO), Sulfur Dioksida (SO₂),
                    Nitrogen Dioksida (NO₂), dan Ozon (O₃) sesuai dengan
                    Peraturan MenteriLingkungan Hidup No 12 tahun 2020.
                  </p>
                </div>
              </div>

              {/* Indeks Kualitas Udara */}
              <div className="tentang-block-figma fade-in-section">
                <h3 className="tentang-block-title-figma">
                  Indeks Kualitas Udara berdasarkan{" "}
                  <span className="text-blue">ISPU</span>
                </h3>
                <div className="ispu-cards-figma">
                  {[
                    {
                      range: "(0-50)",
                      label: "Baik",
                      warna: "#16a34a",
                      desc: "Tingkat kualitas udara yang sangat baik. Tidak memberikan efek negatif pada manusia, hewan, maupun tumbuhan.",
                    },
                    {
                      range: "(51-100)",
                      label: "Sedang",
                      warna: "#0ea5e9",
                      desc: "Kualitas udara masih dapat diterima secara umum dan tidak memberikan dampak buruk pada kesehatan makhluk hidup.",
                    },
                    {
                      range: "(101-200)",
                      label: "Tidak Sehat",
                      warna: "#f97316",
                      desc: "Tingkat kualitas udara yang mulai merugikan kesehatan manusia, hewan, dan tumbuhan di sekitarnya.",
                    },
                    {
                      range: "(201-300)",
                      label: "Sangat Tidak\nSehat",
                      warna: "#ef4444",
                      desc: "Kualitas udara berada pada tingkat yang dapat merugikan kesehatan pada sejumlah segmen populasi yang terpapar.",
                    },
                    {
                      range: "(>300)",
                      label: "Berbahaya",
                      warna: "#a855f7",
                      desc: "Tingkat kualitas udara yang sangat serius dan dapat mengakibatkan kerusakan kesehatan yang parah.",
                    },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className="ispu-card-figma"
                      style={{ borderColor: k.warna }}
                    >
                      <div
                        className="ispu-card-title-figma"
                        style={{ color: k.warna }}
                      >
                        {k.label} {k.range}
                      </div>
                      <div className="ispu-card-desc-figma">{k.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parameter Polutan */}
              <div className="tentang-block-figma fade-in-section">
                <h3
                  className="tentang-block-title-figma"
                  style={{ color: "var(--text-color, #1e293b)" }}
                >
                  Parameter <span style={{ color: "#3b82f6" }}>Polutan</span>{" "}
                  yang Diukur
                </h3>
                <div className="polutan-grid-figma">
                  {[
                    {
                      kode: "PM2.5",
                      label: "PM\n2.5",
                      desc: "Partikel berdiameter kurang dari 2,5 mikrometer yang berasal dari asap kendaraan, industri, dan pembakaran biomassa. Sangat berbahaya karena dapat menembus jauh ke saluran pernapasan terdalam dan masuk ke aliran darah.",
                    },
                    {
                      kode: "PM10",
                      label: "PM\n10",
                      desc: "Partikel berdiameter kurang dari 10 mikrometer yang bersumber dari debu jalan, konstruksi, dan aktivitas industri. Dapat terhirup dan mengendap di saluran pernapasan bagian atas, menyebabkan iritasi dan gangguan pernapasan.",
                    },
                    {
                      kode: "NO2",
                      label: "NO2",
                      desc: "Gas berwarna coklat kemerahan yang terbentuk dari pembakaran bahan bakar kendaraan dan industri. Paparan jangka pendek dapat memperburuk asma, sementara paparan jangka panjang meningkatkan risiko penyakit paru kronis.",
                    },
                    {
                      kode: "SO2",
                      label: "SO2",
                      desc: "Gas tajam berbau menyengat yang dihasilkan dari pembakaran bahan bakar fosil yang mengandung belerang, seperti di pembangkit listrik dan pabrik. Dapat menyebabkan iritasi mata, hidung, dan tenggorokan serta memperburuk kondisi asma.",
                    },
                    {
                      kode: "CO",
                      label: "CO",
                      desc: "Gas tidak berwarna dan tidak berbau yang dihasilkan dari proses pembakaran tidak sempurna, seperti gas buang kendaraan bermotor. Mengikat hemoglobin lebih kuat dari oksigen sehingga mengurangi kemampuan darah mengangkut oksigen ke organ vital.",
                    },
                    {
                      kode: "O3",
                      label: "O3",
                      desc: "Gas polutan sekunder yang terbentuk dari reaksi kimia polutan lain di udara di bawah sinar matahari. Berbeda dengan lapisan ozon pelindung di stratosfer, ozon di permukaan tanah berbahaya bagi pernapasan dan dapat merusak jaringan paru.",
                    },
                  ].map((p) => (
                    <div key={p.kode} className="polutan-card-figma">
                      <div
                        className="polutan-card-body-figma"
                        style={{
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          paddingTop: "80px",
                          paddingBottom: "20px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          height: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          className="polutan-icon-circle-figma"
                          style={{ position: "absolute", top: "15px" }}
                        >
                          <span
                            style={{
                              whiteSpace: "pre-wrap",
                              textAlign: "center",
                              lineHeight: "1.2",
                            }}
                          >
                            {p.label}
                          </span>
                        </div>
                        <p style={{ textAlign: "center", margin: 0, flex: 1 }}>
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Meteorologi */}
              <div
                className="tentang-block-figma fade-in-section"
                style={{ marginBottom: "4rem" }}
              >
                <h3 className="tentang-block-title-figma">
                  Parameter <span className="text-blue">Meteorologi</span> yang
                  Diukur
                </h3>
                <p className="tentang-block-sub-figma">
                  Data kondisi cuaca dan atmosfer yang turut memengaruhi
                  penyebaran dan konsentrasi polutan udara di Jakarta.
                </p>
                <div className="meteo-grid-figma">
                  {[
                    {
                      kode: "Kecepatan Angin",
                      icon: iconWind,
                      desc: "Persentase kandungan uap air di udara terhadap kapasitas maksimumnya pada suhu tertentu, diukur dalam persen (%). Kelembapan tinggi dapat memperburuk konsentrasi partikel higroskopis dan memperparah kabut polusi.",
                    },
                    {
                      kode: "Kelembapan",
                      icon: iconHumidity,
                      desc: "Persentase kandungan uap air di udara terhadap kapasitas maksimumnya pada suhu tertentu, diukur dalam persen (%). Kelembapan tinggi dapat memperburuk konsentrasi partikel higroskopis dan memperparah kabut polusi.",
                    },
                    {
                      kode: "Suhu Udara",
                      icon: iconTemp,
                      desc: "Suhu udara ambien diukur dalam satuan derajat Celcius (°C). Suhu yang tinggi dapat mempercepat reaksi kimia pembentukan polutan sekunder seperti ozon permukaan dan meningkatkan penguapan senyawa organik berbahaya.",
                    },
                    {
                      kode: "Curah Hujan",
                      icon: iconRainy,
                      desc: "Jumlah air yang jatuh ke permukaan bumi selama periode tertentu, diukur dalam milimeter (mm). Hujan efektif membersihkan partikel polutan dari atmosfer melalui proses 'washout'.",
                    },
                  ].map((m) => (
                    <div key={m.kode} className="meteo-col-figma">
                      <div className="meteo-icon-circle-figma">
                        <img src={m.icon} alt={m.kode} />
                      </div>
                      <h4 className="meteo-title-figma">{m.kode}</h4>
                      <p className="meteo-desc-figma">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <FooterApp onNavigate={setAktivMenu} />
        </div>
      )}

      {/* ════════════════════════════════════════════
          HALAMAN PREDIKSI
          ════════════════════════════════════════════ */}
      {aktivMenu === "prediksi" && (
        <div className="page-wrap">
          <main className="prediksi-section-figma">
            <div
              className="prediksi-header-figma"
              style={{
                textAlign: "center",
                marginBottom: "2rem",
                position: "relative",
              }}
            >
              <h1
                className="prediksi-title-figma"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                  color: "var(--text-color, #1e293b)",
                }}
              >
                Prediksi Kualitas Udara
              </h1>
              <p
                style={{
                  color: "var(--text-muted, #64748b)",
                  marginBottom: "1.5rem",
                  fontSize: "1rem",
                }}
              >
                Pilih stasiun SPKU untuk melihat kondisi
                <br />
                udara hari ini
              </p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <StasiunDropdown
                  stasiun={stasiun}
                  pilihan={pilihan}
                  setPilihan={setPilihan}
                  onPrediksi={handlePrediksi}
                  loading={loading}
                />
              </div>
            </div>
            {error && <div className="error-box">{error}</div>}

            {hariIni ? (
              <div
                className="prediksi-content-figma"
                style={{ animation: "fadeIn 0.5s ease-in" }}
              >
                <HasilPrediksi
                  data={hariIni}
                  label="Udara Jakarta Hari ini"
                  mapComponent={
                    <JakartaMapLeaflet
                      selectedStation={pilihan}
                      warna={hariIni.warna}
                      kategori={hariIni.kategori}
                    />
                  }
                />
              </div>
            ) : (
              !loading &&
              !error && (
                <div
                  className="empty-state-figma"
                  style={{
                    textAlign: "center",
                    padding: "4rem",
                    color: "#64748b",
                    animation: "fadeIn 0.5s ease-in",
                  }}
                >
                  <p>
                    Silakan pilih stasiun dan klik{" "}
                    <strong>Prediksi Sekarang</strong> untuk melihat kualitas
                    udara.
                  </p>
                </div>
              )
            )}
          </main>
          <FooterApp onNavigate={setAktivMenu} />
        </div>
      )}
    </div>
  );
}
