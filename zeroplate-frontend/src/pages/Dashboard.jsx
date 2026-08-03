import { useState, useEffect } from "react";
import { donationsAPI, foodRequestsAPI } from "../services/api.js";

function isExpired(expiryDateTime) {
  if (!expiryDateTime) return false;
  try {
    const expiry = new Date(expiryDateTime);
    return isNaN(expiry.getTime()) ? false : expiry < new Date();
  } catch (_) {
    return false;
  }
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeListings: 0,
    byUnit: {},
    byFoodType: {},
    totalRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allDonations, activeDonations, requests] = await Promise.all([
        donationsAPI.getAll(true),
        donationsAPI.getAll(false),
        foodRequestsAPI.getAll(),
      ]);

      const byUnit = {};
      const byFoodType = {};

      allDonations.forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const unit = item.quantityUnit || "portions";
        byUnit[unit] = (byUnit[unit] || 0) + qty;
        const type = item.foodType || "Other";
        byFoodType[type] = (byFoodType[type] || 0) + qty;
      });

      setStats({
        totalDonations: allDonations.length,
        activeListings: activeDonations.length,
        byUnit,
        byFoodType,
        totalRequests: requests.length,
      });
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      setError("Failed to load dashboard statistics. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const totalQuantity = Object.values(stats.byUnit).reduce((a, b) => a + b, 0);
  const unitLabels = {
    kg: "Kg",
    packets: "Packets",
    boxes: "Boxes",
    portions: "Portions",
  };

  return (
    <div className="page-container">
      <h1>Food Saved Dashboard 🌱</h1>
      <p className="page-intro">
        Impact from surplus food donated through ZeroPlate. Every listing is food that didn’t go to waste.
      </p>

      {loading ? (
        <div className="dashboard-empty">
          <p>Loading dashboard statistics...</p>
        </div>
      ) : error ? (
        <div className="dashboard-empty">
          <p style={{ color: "#ef4444" }}>{error}</p>
        </div>
      ) : (
        <>
      <div className="dashboard-grid">
        <div className="dashboard-card dashboard-card-hero">
          <div className="dashboard-card-icon">🍽️</div>
          <div className="dashboard-card-value">
            {totalQuantity.toLocaleString()}
          </div>
          <div className="dashboard-card-label">Total units of food saved</div>
          <p className="dashboard-card-desc">
            Sum of all donated quantities (kg, packets, boxes, portions, etc.)
          </p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">📋</div>
          <div className="dashboard-card-value">{stats.totalDonations}</div>
          <div className="dashboard-card-label">Total donations</div>
          <p className="dashboard-card-desc">Donation listings submitted (all time)</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">✅</div>
          <div className="dashboard-card-value">{stats.activeListings}</div>
          <div className="dashboard-card-label">Active listings</div>
          <p className="dashboard-card-desc">Currently available (not expired)</p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">🤝</div>
          <div className="dashboard-card-value">{stats.totalRequests}</div>
          <div className="dashboard-card-label">NGO requests</div>
          <p className="dashboard-card-desc">Requests from NGOs for donated food</p>
        </div>
      </div>

      {Object.keys(stats.byUnit).length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Food saved by unit</h2>
          <div className="dashboard-by-unit">
            {Object.entries(stats.byUnit)
              .sort((a, b) => b[1] - a[1])
              .map(([unit, qty]) => (
                <div key={unit} className="dashboard-unit-row">
                  <span className="dashboard-unit-label">
                    {unitLabels[unit] || unit}
                  </span>
                  <span className="dashboard-unit-value">
                    {Number(qty).toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {Object.keys(stats.byFoodType).length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">By food type</h2>
          <div className="dashboard-by-type">
            {Object.entries(stats.byFoodType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, qty]) => (
                <div key={type} className="dashboard-type-chip">
                  <span className="dashboard-type-name">{type}</span>
                  <span className="dashboard-type-qty">{Number(qty).toLocaleString()} units</span>
                </div>
              ))}
          </div>
        </section>
      )}

      {stats.totalDonations === 0 && (
        <div className="dashboard-empty">
          <p>No donations yet. When donors submit surplus food, stats will appear here.</p>
          <p className="dashboard-empty-hint">Share the Donate page to start saving food.</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
