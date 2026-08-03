import { useState, useEffect } from "react";
import { donationsAPI, foodRequestsAPI, trustedNgosAPI } from "../services/api.js";

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

function AvailableFoods() {
  const [foods, setFoods] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestModal, setRequestModal] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    loadFoods();
    loadRequests();
    loadNgos();
  }, []);

  const loadFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await donationsAPI.getAll(false);
      setFoods(data);
    } catch (err) {
      console.error("Failed to load foods:", err);
      setError("Failed to load available foods. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await foodRequestsAPI.getAll();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  const loadNgos = async () => {
    try {
      const data = await trustedNgosAPI.getAll();
      setNgos(data);
    } catch (err) {
      console.error("Failed to load NGOs for priority scoring:", err);
    }
  };

  const getRequestsForFood = (foodId) =>
    requests.filter((r) => String(r.foodId) === String(foodId));

  const handleOpenRequest = (item) => {
    setRequestModal(item);
    setRequestSuccess(null);
  };

  const handleCloseRequest = () => {
    setRequestModal(null);
    setRequestSuccess(null);
  };

  const [viewRequestsFor, setViewRequestsFor] = useState(null);

  const formatRequestDate = (iso) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
    } catch (_) {
      return iso.slice(0, 16).replace("T", " ");
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    const form = e.target;
    const ngoName = form.ngoName?.value?.trim();
    const contactPerson = form.contactPerson?.value?.trim();
    const email = form.email?.value?.trim();
    const phone = form.phone?.value?.trim();
    const message = form.message?.value?.trim();
    if (!ngoName || !contactPerson || !email || !phone) return;

    try {
      const requestData = {
        foodId: requestModal._id || requestModal.id,
        foodDescription: requestModal.foodDescription,
        donorName: requestModal.donorName,
        donorEmail: requestModal.email,
        donorPhone: requestModal.phone,
        ngoName,
        contactPerson,
        email,
        phone,
        message: message || "",
      };

      const entry = await foodRequestsAPI.create(requestData);
      setRequests((prev) => [...prev, entry]);
      setRequestSuccess(entry);
      form.reset();
    } catch (err) {
      console.error("Failed to submit request:", err);
      alert("Failed to submit request. Please try again.");
    }
  };

  const computePriorityScore = (donorPin, ngoPin) => {
    if (!donorPin || !ngoPin) return null;
    const d = parseInt(String(donorPin).trim(), 10);
    const n = parseInt(String(ngoPin).trim(), 10);
    if (Number.isNaN(d) || Number.isNaN(n)) return null;

    const diff = Math.abs(d - n);
    const MAX_DIFF = 5000; // treat anything beyond this as "far"
    const clamped = Math.min(diff, MAX_DIFF);

    // 0 diff -> 10, max diff -> 1 (linearly scaled)
    const raw = 10 - (9 * clamped) / MAX_DIFF;
    const score = Math.round(raw);

    return Math.max(1, Math.min(10, score));
  };

  const getTopNgosForFood = (food, limit = 3) => {
    if (!food || !food.pincode || !Array.isArray(ngos) || ngos.length === 0) {
      return [];
    }

    const donorPin = food.pincode;

    const scored = ngos
      .map((ngo) => {
        const score = computePriorityScore(donorPin, ngo.pincode);
        return score ? { ...ngo, _priorityScore: score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b._priorityScore - a._priorityScore);

    return scored.slice(0, limit);
  };

  return (
    <div className="page-container">
      <h1>Available Foods 🍱</h1>
      <p className="page-intro">
        Surplus food donated and available for pickup. NGOs can request food and contact donors to collect.
      </p>

      {loading ? (
        <div className="available-foods-empty">
          <p>Loading available foods...</p>
        </div>
      ) : error ? (
        <div className="available-foods-empty">
          <p style={{ color: "#ef4444" }}>{error}</p>
        </div>
      ) : foods.length === 0 ? (
        <div className="available-foods-empty">
          <p>No available food listings yet.</p>
          <p>When donors submit surplus food, it will appear here.</p>
        </div>
      ) : (
        <div className="available-foods-grid">
          {foods.map((item) => (
              <article key={item._id || item.id} className="food-card">
                {item.photo && (
                  <div style={{ 
                    width: "100%", 
                    height: "200px", 
                    overflow: "hidden",
                    borderRadius: "12px 12px 0 0",
                    marginBottom: "12px"
                  }}>
                    <img 
                      src={item.photo} 
                      alt={item.foodDescription || "Food"} 
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                )}
                <div className="food-card-header">
                  <span className="food-card-type">{item.foodType || "Food"}</span>
                  <span className="food-card-qty">
                    {item.quantity} {item.quantityUnit || "portions"}
                  </span>
                </div>
                <h3 className="food-card-title">{item.foodDescription || "Surplus food"}</h3>
                {item.packaging && (
                  <p className="food-card-meta">Packaging: {item.packaging}</p>
                )}
                <p className="food-card-expiry">
                  Best before: {formatDateTime(item.expiryDateTime)}
                </p>
                <p className="food-card-pickup">
                  Pickup by: {formatDateTime(item.pickupDateTime)}
                </p>
                <div className="food-card-address">
                  <strong>Pickup</strong>: {item.pickupAddress}, {item.city} {item.pincode}
                </div>
                {item.pickupInstructions && (
                  <p className="food-card-notes">{item.pickupInstructions}</p>
                )}
                <div className="food-card-donor">
                  <strong>Donor</strong>: {item.donorName}
                  <br />
                  Contact: {item.contactPerson} · {item.phone}
                  <br />
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                </div>
                {ngos.length > 0 && (
                  (() => {
                    const nearest = getTopNgosForFood(item);
                    if (nearest.length === 0) return null;
                    return (
                      <div className="food-card-ngos" style={{ marginTop: "8px" }}>
                        <strong>Nearest trusted NGOs (priority 1–10)</strong>
                        <ul style={{ marginTop: "4px", paddingLeft: "18px", fontSize: "0.9rem" }}>
                          {nearest.map((ngo) => (
                            <li key={ngo._id || ngo.id}>
                              {ngo.ngoName} ({ngo.city} {ngo.pincode}) — Priority{" "}
                              {ngo._priorityScore}/10
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()
                )}
                <div className="food-card-actions">
                  <button
                    type="button"
                    className="food-card-request-btn"
                    onClick={() => handleOpenRequest(item)}
                  >
                    Request this food
                  </button>
                  <button
                    type="button"
                    className="food-card-view-requests-btn"
                    onClick={() => setViewRequestsFor(item)}
                  >
                    View requests ({getRequestsForFood(item._id || item.id).length})
                  </button>
                </div>
              </article>
          ))}
        </div>
      )}

      {viewRequestsFor && (
        <div className="request-modal-overlay" onClick={() => setViewRequestsFor(null)}>
          <div className="request-modal view-requests-modal" onClick={(e) => e.stopPropagation()}>
            <div className="request-modal-header">
              <h3>Who requested this food</h3>
              <button type="button" className="request-modal-close" onClick={() => setViewRequestsFor(null)} aria-label="Close">
                ×
              </button>
            </div>
            <p className="request-modal-food">
              {viewRequestsFor.foodDescription || "Surplus food"} · {viewRequestsFor.quantity} {viewRequestsFor.quantityUnit || "portions"}
            </p>
            <div className="view-requests-list">
              {getRequestsForFood(viewRequestsFor._id || viewRequestsFor.id).length === 0 ? (
                <p className="view-requests-empty">No requests yet for this listing.</p>
              ) : (
                getRequestsForFood(viewRequestsFor._id || viewRequestsFor.id).map((req) => (
                  <div key={req._id || req.requestId} className="view-requests-item">
                    <div className="view-requests-item-header">
                      <strong>{req.ngoName}</strong>
                      <span className="view-requests-date">{formatRequestDate(req.createdAt || req.requestedAt)}</span>
                    </div>
                    <p className="view-requests-contact">
                      {req.contactPerson}
                      {" · "}
                      <a href={`mailto:${req.email}`}>{req.email}</a>
                      {" · "}
                      <a href={`tel:${req.phone}`}>{req.phone}</a>
                    </p>
                    {req.message && (
                      <p className="view-requests-message">"{req.message}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="request-modal-buttons" style={{ marginTop: "16px" }}>
              <button type="button" className="food-card-request-btn" onClick={() => setViewRequestsFor(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {requestModal && (
        <div className="request-modal-overlay" onClick={handleCloseRequest}>
          <div className="request-modal" onClick={(e) => e.stopPropagation()}>
            <div className="request-modal-header">
              <h3>Request this food</h3>
              <button type="button" className="request-modal-close" onClick={handleCloseRequest} aria-label="Close">
                ×
              </button>
            </div>
            <p className="request-modal-food">
              {requestModal.foodDescription || "Surplus food"} · {requestModal.quantity} {requestModal.quantityUnit || "portions"}
            </p>

            {requestSuccess ? (
              <div className="request-modal-success">
                <p><strong>Request sent!</strong></p>
                <p>Contact the donor to arrange pickup:</p>
                <p>
                  <a href={`mailto:${requestSuccess.donorEmail}`}>{requestSuccess.donorEmail}</a>
                  {" · "}
                  <a href={`tel:${requestSuccess.donorPhone}`}>{requestSuccess.donorPhone}</a>
                </p>
                <button type="button" className="food-card-request-btn" onClick={handleCloseRequest}>
                  Done
                </button>
              </div>
            ) : (
              <form className="request-modal-form" onSubmit={handleSubmitRequest}>
                <label>NGO / Organization name *</label>
                <input type="text" name="ngoName" required placeholder="Your organization" />
                <label>Contact person *</label>
                <input type="text" name="contactPerson" required placeholder="Full name" />
                <label>Email *</label>
                <input type="email" name="email" required placeholder="email@example.com" />
                <label>Phone *</label>
                <input type="tel" name="phone" required placeholder="10-digit number" />
                <label>Message (optional)</label>
                <textarea name="message" rows={2} placeholder="e.g. We can pick up today afternoon" />
                <div className="request-modal-buttons">
                  <button type="button" className="request-modal-cancel" onClick={handleCloseRequest}>
                    Cancel
                  </button>
                  <button type="submit" className="food-card-request-btn">
                    Send request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailableFoods;
