export default function StasiunDropdown({
  stasiun,
  pilihan,
  setPilihan,
  onPrediksi,
  loading,
}) {
  return (
    <div className="search-box">
      <div className="select-wrapper">
        <select
          className="stasiun-select"
          value={pilihan}
          onChange={(e) => setPilihan(e.target.value)}
        >
          <option value="">Pilih stasiun pemantauan...</option>
          {stasiun.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        className="prediksi-btn"
        onClick={onPrediksi}
        disabled={!pilihan || loading}
      >
        {loading ? (
          <span className="loading-dots">
            <span />
            <span />
            <span />
          </span>
        ) : (
          "Prediksi Sekarang"
        )}
      </button>
    </div>
  );
}
