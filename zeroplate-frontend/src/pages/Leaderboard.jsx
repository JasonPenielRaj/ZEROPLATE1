import { useState, useEffect } from "react";
import { donationsAPI } from "../services/api.js";

function formatDateTime(str) {
  if (!str) return "—";
  try {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      const s = String(str).trim();
      const d = s.replace("T", " ");
      return d.slice(0, 16);
    }
    return date.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch (_) {
    const s = String(str).trim();
    const d = s.replace("T", " ");
    return d.slice(0, 16);
  }
}

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonor, setSelectedDonor] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const allDonations = await donationsAPI.getAll(true);

      const donorTotals = {};

      allDonations.forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const email = (item.email || "").trim();
        const name = (item.donorName || "").trim() || "Anonymous donor";
        const key = email || name;

        if (!donorTotals[key]) {
          donorTotals[key] = {
            id: key,
            name,
            email,
            totalQuantity: 0,
            totalDonations: 0,
            contactPerson: "",
            phone: "",
            city: "",
            pincode: "",
            pickupAddress: "",
            donations: [],
          };
        }

        donorTotals[key].totalQuantity += qty;
        donorTotals[key].totalDonations += 1;

        const createdAt = item.createdAt
          ? new Date(item.createdAt).getTime()
          : 0;
        const currentLatest = donorTotals[key]._latestCreatedAt || 0;
        if (createdAt >= currentLatest) {
          donorTotals[key]._latestCreatedAt = createdAt;
          donorTotals[key].contactPerson =
            item.contactPerson || donorTotals[key].contactPerson;
          donorTotals[key].phone = item.phone || donorTotals[key].phone;
          donorTotals[key].city = item.city || donorTotals[key].city;
          donorTotals[key].pincode = item.pincode || donorTotals[key].pincode;
          donorTotals[key].pickupAddress =
            item.pickupAddress || donorTotals[key].pickupAddress;
        }

        donorTotals[key].donations.push({
          id:
            item._id ||
            item.id ||
            `${key}-${donorTotals[key].donations.length}`,
          foodType: item.foodType,
          foodDescription: item.foodDescription,
          quantity: item.quantity,
          quantityUnit: item.quantityUnit,
          packaging: item.packaging,
          city: item.city,
          pincode: item.pincode,
          pickupAddress: item.pickupAddress,
          pickupDateTime: item.pickupDateTime,
          expiryDateTime: item.expiryDateTime,
          createdAt: item.createdAt,
        });
      });

      const sorted = Object.values(donorTotals).sort(
        (a, b) =>
          b.totalQuantity - a.totalQuantity ||
          b.totalDonations - a.totalDonations
      );

      setLeaderboard(sorted);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
      setError("Failed to load leaderboard. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Top Donors Leaderboard 🏆</h1>
      <p className="page-intro">
        Ranked by total quantity donated across all time. Click a donor to see
        their contribution details. The top 3 receive special badges.
      </p>

      {loading ? (
        <div className="dashboard-empty">
          <p>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="dashboard-empty">
          <p style={{ color: "#ef4444" }}>{error}</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="dashboard-empty">
          <p>No donations yet. Once donors start contributing, the leaderboard will appear here.</p>
        </div>
      ) : (
        <>
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Top donors</h2>
            <div className="dashboard-leaderboard">
              {leaderboard.slice(0, 20).map((entry, index) => {
                let badge = null;
                if (index === 0) badge = "🏆";
                else if (index === 1) badge = "🥈";
                else if (index === 2) badge = "🥉";

                return (
                  <button
                    key={entry.id}
                    type="button"
                    className="dashboard-leader-row dashboard-leader-row-button"
                    onClick={() =>
                      setSelectedDonor({
                        ...entry,
                        _rank: index + 1,
                        _badge: badge,
                      })
                    }
                    aria-label={`View details for ${entry.name}`}
                  >
                    <div className="dashboard-leader-rank">
                      {badge ? (
                        <span className="dashboard-leader-badge">{badge}</span>
                      ) : (
                        <span className="dashboard-leader-rank-number">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="dashboard-leader-main">
                      <div className="dashboard-leader-name">{entry.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {selectedDonor && (
            <div
              className="request-modal-overlay"
              onClick={() => setSelectedDonor(null)}
            >
              <div
                className="request-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "680px" }}
              >
                <div className="request-modal-header">
                  <h3>
                    Donor details{" "}
                    {selectedDonor._badge ? <span>{selectedDonor._badge}</span> : null}
                  </h3>
                  <button
                    type="button"
                    className="request-modal-close"
                    onClick={() => setSelectedDonor(null)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="request-modal-success">
                  <p style={{ marginTop: 0 }}>
                    <strong>Name:</strong> {selectedDonor.name}
                  </p>
                  <p>
                    <strong>Rank:</strong> #{selectedDonor._rank}
                  </p>
                  <p>
                    <strong>Total donated:</strong>{" "}
                    {Number(selectedDonor.totalQuantity || 0).toLocaleString()}{" "}
                    units
                  </p>
                  <p>
                    <strong>Total donations:</strong>{" "}
                    {selectedDonor.totalDonations}
                  </p>

                  {(selectedDonor.contactPerson ||
                    selectedDonor.email ||
                    selectedDonor.phone ||
                    selectedDonor.city ||
                    selectedDonor.pincode ||
                    selectedDonor.pickupAddress) && (
                    <>
                      <p style={{ marginTop: "14px" }}>
                        <strong>Contact & location</strong>
                      </p>
                      {selectedDonor.contactPerson && (
                        <p>
                          <strong>Contact person:</strong>{" "}
                          {selectedDonor.contactPerson}
                        </p>
                      )}
                      {selectedDonor.email && (
                        <p>
                          <strong>Email:</strong>{" "}
                          <a href={`mailto:${selectedDonor.email}`}>
                            {selectedDonor.email}
                          </a>
                        </p>
                      )}
                      {selectedDonor.phone && (
                        <p>
                          <strong>Phone:</strong>{" "}
                          <a href={`tel:${selectedDonor.phone}`}>
                            {selectedDonor.phone}
                          </a>
                        </p>
                      )}
                      {(selectedDonor.city || selectedDonor.pincode) && (
                        <p>
                          <strong>Area:</strong> {selectedDonor.city}{" "}
                          {selectedDonor.pincode}
                        </p>
                      )}
                      {selectedDonor.pickupAddress && (
                        <p>
                          <strong>Pickup address:</strong>{" "}
                          {selectedDonor.pickupAddress}
                        </p>
                      )}
                    </>
                  )}

                  {Array.isArray(selectedDonor.donations) &&
                    selectedDonor.donations.length > 0 && (
                      <>
                        <p style={{ marginTop: "14px" }}>
                          <strong>Donation history</strong>
                        </p>
                        <div
                          style={{
                            borderTop: "1px solid #334155",
                            marginTop: "8px",
                          }}
                        >
                          {selectedDonor.donations
                            .slice()
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt || 0) -
                                new Date(a.createdAt || 0)
                            )
                            .slice(0, 8)
                            .map((d) => (
                              <div
                                key={d.id}
                                style={{
                                  padding: "10px 0",
                                  borderBottom: "1px solid #334155",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "12px",
                                  }}
                                >
                                  <strong style={{ color: "#f1f5f9" }}>
                                    {d.foodDescription ||
                                      d.foodType ||
                                      "Food donation"}
                                  </strong>
                                  <span
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    {formatDateTime(d.createdAt)}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    color: "#cbd5e1",
                                    fontSize: "0.9rem",
                                    marginTop: "4px",
                                  }}
                                >
                                  Qty: {d.quantity}{" "}
                                  {d.quantityUnit || "portions"}
                                  {d.city || d.pincode
                                    ? ` · ${d.city || ""} ${d.pincode || ""}`
                                    : ""}
                                </div>
                                <div
                                  style={{
                                    color: "#94a3b8",
                                    fontSize: "0.85rem",
                                    marginTop: "4px",
                                  }}
                                >
                                  Pickup: {formatDateTime(d.pickupDateTime)} ·
                                  Expiry: {formatDateTime(d.expiryDateTime)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </>
                    )}

                  <div
                    className="request-modal-buttons"
                    style={{ marginTop: "16px" }}
                  >
                    <button
                      type="button"
                      className="food-card-request-btn"
                      onClick={() => setSelectedDonor(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Leaderboard;

