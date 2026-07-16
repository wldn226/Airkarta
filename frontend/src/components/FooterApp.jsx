export default function FooterApp({ onNavigate }) {
  return (
    <footer className="footer-beranda">
      <div className="footer-grid">
        {/* Brand col */}
        <div className="footer-col">
          <div className="footer-brand">
            <div className="brand-logo" style={{ width: 26, height: 26 }}>
              <div className="brand-logo-inner" />
            </div>
            <span className="brand-text">
              <span style={{ color: "#3b82f6" }}>AIR</span>
              <span style={{ color: "inherit" }}>KARTA</span>
            </span>
          </div>
          <p className="footer-desc">
            Sistem prediksi kualitas udara DKI Jakarta berbasis machine
            learning. Dibangun untuk mendukung kesadaran masyarakat terhadap
            polusi udara.
          </p>
        </div>

        {/* Nav col */}
        <div className="footer-col">
          <div className="footer-col-title">Navigasi</div>
          <ul className="footer-links">
            <li>
              <button onClick={() => onNavigate("beranda")}>Beranda</button>
            </li>
            <li>
              <button onClick={() => onNavigate("prediksi")}>Prediksi</button>
            </li>
          </ul>
        </div>

        {/* Data col */}
        <div className="footer-col">
          <div className="footer-col-title">Sumber Data</div>
          <ul className="footer-links">
            <li>
              <span>Satu Data Jakarta</span>
            </li>
            <li>
              <span>OpenWeatherMap API</span>
            </li>
            <li>
              <span>Open-Meteo Archive</span>
            </li>
          </ul>
        </div>

        {/* Model col */}
        <div className="footer-col">
          <div className="footer-col-title">Model AI</div>
          <ul className="footer-links">
            <li>
              <span>LightGBM Ensemble</span>
            </li>
            <li>
              <span>XGBoost</span>
            </li>
            <li>
              <span>Optuna Tuning</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
