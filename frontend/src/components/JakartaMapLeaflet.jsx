import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Koordinat asli 5 stasiun SPKU DKI Jakarta
const STASIUN_KOORDINAT = {
  "DKI1 (Bunderan HI)": { lat: -6.1944, lng: 106.8229, area: "Jakarta Pusat" },
  "DKI2 (Kelapa Gading)": {
    lat: -6.1581,
    lng: 106.9054,
    area: "Jakarta Utara",
  },
  "DKI3 (Jagakarsa)": { lat: -6.3536, lng: 106.834, area: "Jakarta Selatan" },
  "DKI4 (Lubang Buaya)": { lat: -6.274, lng: 106.9145, area: "Jakarta Timur" },
  "DKI5 (Kebon Jeruk)": { lat: -6.1946, lng: 106.7643, area: "Jakarta Barat" },
};

// Buat custom HTML marker
function buatMarker(isActive, warna) {
  const color = isActive ? warna || "#f97316" : "#94a3b8";
  const size = isActive ? 38 : 28;
  const shadow = isActive
    ? `0 0 18px ${color}99, 0 4px 12px rgba(0,0,0,0.25)`
    : "0 2px 8px rgba(0,0,0,0.2)";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid #ffffff;
        box-shadow: ${shadow};
        display: flex; align-items: center; justify-content: center;
        position: relative;
      ">
        <div style="
          width: ${size * 0.32}px; height: ${size * 0.32}px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
        "></div>
        ${
          isActive
            ? `
          <div style="
            position: absolute; inset: -7px;
            border-radius: 50%;
            border: 2px solid ${color};
            animation: pulse-ring 1.8s ease-out infinite;
            opacity: 0.55;
          "></div>
        `
            : ""
        }
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 8)],
  });
}

function buatPopup(nama, pos, isActive, warna, kategori) {
  return `
    <div style="font-family:Inter,sans-serif;min-width:180px;padding:2px 0">
      <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:3px">${nama}</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:${isActive && kategori ? "8px" : "0"}">${pos.area}</div>
      ${
        isActive && kategori
          ? `
        <div style="
          padding:5px 10px; border-radius:7px;
          background:${warna}18; border:1px solid ${warna}55;
          color:${warna}; font-size:11px; font-weight:700;
          display:inline-block;
        ">${kategori}</div>
      `
          : ""
      }
    </div>
  `;
}

export default function JakartaMapLeaflet({
  selectedStation,
  warna,
  kategori,
}) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const markersRef = useRef({});

  // Inisialisasi peta (hanya sekali)
  useEffect(() => {
    if (instanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-6.25, 106.83], // pusat Jakarta, sedikit ke selatan agar semua stasiun kelihatan
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    // Tile terang — CartoDB Voyager (berwarna, jelas, cocok siang hari)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd" },
    ).addTo(map);

    // Tambah semua marker
    Object.entries(STASIUN_KOORDINAT).forEach(([nama, pos]) => {
      const isActive = nama === selectedStation;
      const marker = L.marker([pos.lat, pos.lng], {
        icon: buatMarker(isActive, warna),
      });
      marker.bindPopup(buatPopup(nama, pos, isActive, warna, kategori), {
        className: "leaflet-popup-light",
        maxWidth: 240,
      });
      marker.addTo(map);
      markersRef.current[nama] = marker;
    });

    instanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 120);

    return () => {
      map.remove();
      instanceRef.current = null;
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker & fly saat stasiun berubah
  useEffect(() => {
    if (!instanceRef.current) return;

    Object.entries(STASIUN_KOORDINAT).forEach(([nama, pos]) => {
      const marker = markersRef.current[nama];
      if (!marker) return;
      const isActive = nama === selectedStation;

      marker.setIcon(buatMarker(isActive, warna));
      marker.setPopupContent(buatPopup(nama, pos, isActive, warna, kategori));
    });

    if (selectedStation && STASIUN_KOORDINAT[selectedStation]) {
      const { lat, lng } = STASIUN_KOORDINAT[selectedStation];
      instanceRef.current.flyTo([lat, lng], 13, { duration: 1.3 });
      setTimeout(() => markersRef.current[selectedStation]?.openPopup(), 1500);
    }
  }, [selectedStation, warna, kategori]);

  return (
    <div className="map-card">
      <div className="map-title">Peta Stasiun SPKU Jakarta</div>

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.55; }
          100% { transform: scale(2.4); opacity: 0;    }
        }
        .leaflet-popup-light .leaflet-popup-content-wrapper {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.13);
          color: #0f172a;
        }
        .leaflet-popup-light .leaflet-popup-tip {
          background: #ffffff;
        }
        .leaflet-popup-light .leaflet-popup-close-button {
          color: #94a3b8 !important;
          font-size: 16px !important;
        }
        .leaflet-popup-light .leaflet-popup-content {
          margin: 12px 16px;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.12) !important;
        }
        .leaflet-control-zoom a {
          background: #ffffff !important;
          color: #475569 !important;
          border-color: #e2e8f0 !important;
          font-weight: 700 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }
      `}</style>

      <div
        ref={mapRef}
        style={{
          height: "520px",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          marginBottom: "0.85rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      />

      {/* Legenda stasiun */}
      <div
        className="map-legend"
        style={{ flexWrap: "wrap", gap: "0.5rem 1rem" }}
      >
        {Object.entries(STASIUN_KOORDINAT).map(([nama]) => {
          const isActive = nama === selectedStation;
          const dot = isActive ? warna || "#f97316" : "#94a3b8";
          return (
            <span key={nama} className="map-legend-item">
              <span className="map-legend-dot" style={{ background: dot }} />
              <span
                style={{
                  color: isActive ? warna || "#f97316" : undefined,
                  fontWeight: isActive ? 700 : undefined,
                }}
              >
                {nama}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
