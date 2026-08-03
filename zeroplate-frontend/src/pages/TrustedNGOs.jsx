import { useState, useEffect } from "react";
import { trustedNgosAPI } from "../services/api.js";

function formatDateTime(str) {
  if (!str) return "—";
  try {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      const s = String(str).trim();
      const d = s.replace("T", " ");
      return d.slice(0, 16);
    }
    return date.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  } catch (_) {
    const s = String(str).trim();
    const d = s.replace("T", " ");
    return d.slice(0, 16);
  }
}

function TrustedNGOs() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNGOs();
  }, []);

  const loadNGOs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trustedNgosAPI.getAll();
      setNgos(data);
    } catch (err) {
      console.error("Failed to load NGOs:", err);
      setError("Failed to load trusted NGOs. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>NGO Requests 🤝</h1>
      <p className="page-intro">
        NGOs that have registered with ZeroPlate and submitted food requests. Donors can connect with them to distribute surplus food.
      </p>

      {loading ? (
        <div className="available-foods-empty">
          <p>Loading trusted NGOs...</p>
        </div>
      ) : error ? (
        <div className="available-foods-empty">
          <p style={{ color: "#ef4444" }}>{error}</p>
        </div>
      ) : ngos.length === 0 ? (
        <div className="available-foods-empty">
          <p>No trusted NGOs yet.</p>
          <p>When organizations submit the NGO form, they will appear here.</p>
        </div>
      ) : (
        <div className="trusted-ngos-grid">
          {ngos.map((item) => (
            <article key={item._id || item.id} className="ngo-card">
              <div className="ngo-card-header">
                <h3 className="ngo-card-name">{item.ngoName || "NGO"}</h3>
                {item.urgency && item.urgency !== "Normal" && (
                  <span className={`ngo-card-urgency ngo-card-urgency-${item.urgency.toLowerCase()}`}>
                    {item.urgency}
                  </span>
                )}
              </div>
              <div className="ngo-card-contact">
                <strong>Contact</strong>: {item.contactPerson}
                <br />
                <a href={`mailto:${item.email}`}>{item.email}</a>
                <br />
                <a href={`tel:${item.phone}`}>{item.phone}</a>
              </div>
              {item.registrationNo && (
                <p className="ngo-card-meta">Reg. No: {item.registrationNo}</p>
              )}
              {item.website && (
                <p className="ngo-card-meta">
                  <a href={item.website} target="_blank" rel="noopener noreferrer">{item.website}</a>
                </p>
              )}
              <div className="ngo-card-section">
                <strong>Food needed</strong>: {item.foodType || "—"} · {item.quantity} {item.quantityUnit || "portions"}
              </div>
              {item.beneficiaries && (
                <p className="ngo-card-meta">Beneficiaries: {item.beneficiaries} people</p>
              )}
              {item.purpose && (
                <p className="ngo-card-meta">Purpose: {item.purpose}</p>
              )}
              <div className="ngo-card-address">
                <strong>Delivery</strong>: {item.address}, {item.city} {item.pincode}
              </div>
              {item.deliveryDateTime && (
                <p className="ngo-card-meta">Preferred delivery: {formatDateTime(item.deliveryDateTime)}</p>
              )}
              {item.dietaryRequirements && (
                <p className="ngo-card-meta">Dietary: {item.dietaryRequirements}</p>
              )}
              {item.notes && (
                <p className="ngo-card-notes">{item.notes}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrustedNGOs;
