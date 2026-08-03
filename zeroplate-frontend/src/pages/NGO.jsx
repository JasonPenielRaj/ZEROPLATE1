import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trustedNgosAPI } from "../services/api.js";

const PREFILL_KEY = "zeroplate_ngo_prefill";

function normalizeDateTime(v) {
  const s = String(v).trim();
  if (!s) return "";
  return s.replace(" ", "T").slice(0, 16);
}

function NGO() {
  const location = useLocation();
  // Organization details
  const [ngoName, setNgoName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [website, setWebsite] = useState("");

  // Request details
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("portions");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [deliveryDateTime, setDeliveryDateTime] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [purpose, setPurpose] = useState("");
  const [dietaryRequirements, setDietaryRequirements] = useState("");
  const [notes, setNotes] = useState("");

  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const sectionStyle = { marginBottom: "28px" };
  const rowStyle = { display: "flex", gap: "12px", flexWrap: "wrap" };
  const rowItemStyle = (flex) => ({ flex: flex || "1 1 120px" });

  useEffect(() => {
    if (location.pathname !== "/ngo") return;
    try {
      const raw = sessionStorage.getItem(PREFILL_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      sessionStorage.removeItem(PREFILL_KEY);
      if (data.ngoName != null) setNgoName(String(data.ngoName));
      if (data.contactPerson != null) setContactPerson(String(data.contactPerson));
      if (data.email != null) setEmail(String(data.email));
      if (data.phone != null) setPhone(String(data.phone));
      if (data.registrationNo != null) setRegistrationNo(String(data.registrationNo));
      if (data.website != null) setWebsite(String(data.website));
      if (data.foodType != null) setFoodType(String(data.foodType));
      if (data.quantity != null) setQuantity(String(data.quantity));
      if (data.quantityUnit != null) setQuantityUnit(String(data.quantityUnit));
      if (data.beneficiaries != null) setBeneficiaries(String(data.beneficiaries));
      if (data.deliveryDateTime != null) setDeliveryDateTime(normalizeDateTime(data.deliveryDateTime));
      if (data.address != null) setAddress(String(data.address));
      if (data.city != null) setCity(String(data.city));
      if (data.pincode != null) setPincode(String(data.pincode));
      if (data.urgency != null) setUrgency(String(data.urgency));
      if (data.purpose != null) setPurpose(String(data.purpose));
      if (data.dietaryRequirements != null) setDietaryRequirements(String(data.dietaryRequirements));
      if (data.notes != null) setNotes(String(data.notes));
    } catch (_) {}
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const ngoData = {
        ngoName,
        contactPerson,
        email,
        phone,
        registrationNo,
        website,
        foodType,
        quantity: Number(quantity),
        quantityUnit,
        beneficiaries: Number(beneficiaries),
        deliveryDateTime: new Date(deliveryDateTime).toISOString(),
        address,
        city,
        pincode,
        urgency,
        purpose,
        dietaryRequirements,
        notes,
      };

      await trustedNgosAPI.create(ngoData);

      // Reset form
      setNgoName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setRegistrationNo("");
      setWebsite("");
      setFoodType("");
      setQuantity("");
      setQuantityUnit("portions");
      setBeneficiaries("");
      setDeliveryDateTime("");
      setAddress("");
      setCity("");
      setPincode("");
      setUrgency("Normal");
      setPurpose("");
      setDietaryRequirements("");
      setNotes("");

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(null), 6000);
    } catch (error) {
      console.error("Failed to submit NGO request:", error);
      setSubmitError(error.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h1>NGO Food Request Form 🤝</h1>
      <p className="page-intro">
        Submit a detailed request so donors can match surplus food to your needs.
      </p>

      {submitSuccess && (
        <div className="submit-success-banner">
          <span className="submit-success-icon">✓</span>
          <div>
            <strong>Request submitted!</strong> Your organization is now in the Trusted NGOs list. Donors can see your details and reach out.
          </div>
        </div>
      )}

      {submitError && (
        <div className="submit-success-banner" style={{ background: "rgba(239, 68, 68, 0.2)", borderColor: "rgba(239, 68, 68, 0.5)", color: "#fecaca" }}>
          <span className="submit-success-icon" style={{ background: "#ef4444" }}>✕</span>
          <div>
            <strong>Error:</strong> {submitError}
          </div>
        </div>
      )}

      <form className="ngo-form ngo-form-detailed" onSubmit={handleSubmit}>
        {/* Organization details */}
        <section className="ngo-form-section" style={sectionStyle}>
          <h2 className="ngo-form-section-title" >
            Organization details
          </h2>
          <label>NGO / Organization name *</label>
          <input
            type="text"
            placeholder="e.g. Hope Foundation"
            value={ngoName}
            onChange={(e) => setNgoName(e.target.value)}
            required
          />
          <label>Contact person name *</label>
          <input
            type="text"
            placeholder="Full name"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            required
          />
          <label>Email *</label>
          <input
            type="email"
            placeholder="contact@ngo.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Phone *</label>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <label>Registration number (optional)</label>
          <input
            type="text"
            placeholder="e.g. 12A, 80G registration"
            value={registrationNo}
            onChange={(e) => setRegistrationNo(e.target.value)}
          />
          <label>Website (optional)</label>
          <input
            type="url"
            placeholder="https://..."
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </section>

        {/* Food request details */}
        <section className="ngo-form-section" style={sectionStyle}>
          <h2 className="ngo-form-section-title" >
            Food request details
          </h2>
          <label>Type of food needed *</label>
          <select
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            required
          >
            <option value="">Select type</option>
            <option value="Cooked meals">Cooked meals</option>
            <option value="Dry rations">Dry rations (rice, dal, flour)</option>
            <option value="Fresh vegetables">Fresh vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Dairy">Dairy & eggs</option>
            <option value="Packaged food">Packaged food</option>
            <option value="Mixed/Any">Mixed / Any</option>
          </select>
          <div style={rowStyle}>
            <div style={rowItemStyle()}>
              <label>Quantity *</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div style={rowItemStyle()}>
              <label>Unit</label>
              <select
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
              >
                <option value="kg">Kg</option>
                <option value="packets">Packets</option>
                <option value="boxes">Boxes</option>
                <option value="portions">Portions</option>
              </select>
            </div>
          </div>
          <label>Number of beneficiaries (people to serve) *</label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 100"
            value={beneficiaries}
            onChange={(e) => setBeneficiaries(e.target.value)}
            required
          />
          <label>Preferred delivery date & time *</label>
          <input
            type="datetime-local"
            value={deliveryDateTime}
            onChange={(e) => setDeliveryDateTime(e.target.value)}
            required
          />
          <label>Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <label>Purpose (optional)</label>
          <input
            type="text"
            placeholder="e.g. Daily distribution, relief camp, event"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
          <label>Dietary requirements / restrictions (optional)</label>
          <textarea
            placeholder="e.g. Vegetarian only, no nuts, halal"
            value={dietaryRequirements}
            onChange={(e) => setDietaryRequirements(e.target.value)}
            rows={3}
          />
        </section>

        {/* Delivery address */}
        <section className="ngo-form-section" style={sectionStyle}>
          <h2 className="ngo-form-section-title" >
            Delivery / pickup address
          </h2>
          <label>Full address *</label>
          <textarea
            placeholder="Street, area, landmark"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={3}
          />
          <div style={rowStyle}>
            <div style={rowItemStyle("1 1 140px")}>
              <label>City *</label>
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div style={rowItemStyle("0 1 120px")}>
              <label>Pincode *</label>
              <input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>
          </div>
          <label>Additional notes (optional)</label>
          <textarea
            placeholder="Any instructions for donor or delivery"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </section>

        <button type="submit" className="ngo-form-submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit request"}
        </button>
      </form>
    </div>
  );
}

export default NGO;
