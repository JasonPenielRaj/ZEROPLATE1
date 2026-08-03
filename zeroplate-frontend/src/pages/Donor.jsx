import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { donationsAPI } from "../services/api.js";

const PREFILL_KEY = "zeroplate_donor_prefill";
const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  "AIzaSyDGaQG4WZK5G5yRu0g0_FkPijWwT33UEIs";

function Donor() {
  const location = useLocation();
  // Donor / contact details
  const [donorName, setDonorName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Food donation details
  const [foodType, setFoodType] = useState("");
  const [foodDescription, setFoodDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("portions");
  const [packaging, setPackaging] = useState("");
  const [expiryDateTime, setExpiryDateTime] = useState("");
  const [foodNotes, setFoodNotes] = useState("");

  // Pickup details
  const [pickupAddress, setPickupAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [pickupInstructions, setPickupInstructions] = useState("");

  // Optional preference
  const [donationPreference, setDonationPreference] = useState("Any NGO");

  // Photo upload
  const [photo, setPhoto] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoAnalysisError, setPhotoAnalysisError] = useState(null);
  const [photoAnalysisResult, setPhotoAnalysisResult] = useState(null);

  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const sectionStyle = { marginBottom: "28px" };
  const rowStyle = { display: "flex", gap: "12px", flexWrap: "wrap" };
  const rowItemStyle = (flex) => ({ flex: flex || "1 1 120px" });

  useEffect(() => {
    if (location.pathname !== "/donor") return;
    try {
      const raw = sessionStorage.getItem(PREFILL_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      sessionStorage.removeItem(PREFILL_KEY);
      if (data.donorName != null) setDonorName(String(data.donorName));
      if (data.contactPerson != null) setContactPerson(String(data.contactPerson));
      if (data.email != null) setEmail(String(data.email));
      if (data.phone != null) setPhone(String(data.phone));
      if (data.foodType != null) setFoodType(String(data.foodType));
      if (data.foodDescription != null) setFoodDescription(String(data.foodDescription));
      if (data.quantity != null) setQuantity(String(data.quantity));
      if (data.quantityUnit != null) setQuantityUnit(String(data.quantityUnit));
      if (data.packaging != null) setPackaging(String(data.packaging));
      if (data.expiryDateTime != null) setExpiryDateTime(normalizeDateTime(data.expiryDateTime));
      if (data.foodNotes != null) setFoodNotes(String(data.foodNotes));
      if (data.pickupAddress != null) setPickupAddress(String(data.pickupAddress));
      if (data.city != null) setCity(String(data.city));
      if (data.pincode != null) setPincode(String(data.pincode));
      if (data.pickupDateTime != null) setPickupDateTime(normalizeDateTime(data.pickupDateTime));
      if (data.pickupInstructions != null) setPickupInstructions(String(data.pickupInstructions));
      if (data.donationPreference != null) setDonationPreference(String(data.donationPreference));
    } catch (_) {}
  }, [location.pathname]);

  function normalizeDateTime(v) {
    const s = String(v).trim();
    if (!s) return "";
    return s.replace(" ", "T").slice(0, 16);
  }

  const identifyFoodFromPhoto = async (base64Image) => {
    setIsAnalyzingPhoto(true);
    setPhotoAnalysisError(null);
    setPhotoAnalysisResult(null);

    try {
      const mimeType =
        (base64Image.match(/^data:(image\/\w+);base64/) || [])[1] ||
        "image/jpeg";

      const cleanBase64 = base64Image.replace(
        /^data:image\/\w+;base64,/,
        ""
      );

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
Analyze this food image.

Return ONLY valid JSON:

{
  "name": "food name",
  "quantity_kg": "estimated quantity in kilograms",
  "expiry_estimate": "approx expiry time assuming room temperature"
}

Do not return anything except JSON.
                    `,
                  },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        throw new Error("Failed to analyze photo");
      }

      const data = await response.json();

      const text =
        (data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts[0] &&
          data.candidates[0].content.parts[0].text) ||
        "{}";

      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed && typeof parsed === "object") {
        setPhotoAnalysisResult(parsed);

        if (parsed.name && !foodDescription) {
          setFoodDescription(String(parsed.name));
        }

        const extraNotes = [];

        if (parsed.quantity_kg) {
          extraNotes.push(`Estimated quantity: ${parsed.quantity_kg}`);

          const match = String(parsed.quantity_kg).match(/[\d.]+/);
          if (match && !quantity) {
            setQuantity(match[0]);
            setQuantityUnit("kg");
          }
        }

        if (parsed.expiry_estimate) {
          extraNotes.push(`Approx expiry: ${parsed.expiry_estimate}`);
        }

        if (extraNotes.length > 0) {
          setFoodNotes((prev) =>
            prev
              ? `${prev}\n\nAI estimate from photo:\n- ${extraNotes.join(
                  "\n- "
                )}`
              : `AI estimate from photo:\n- ${extraNotes.join("\n- ")}`
          );
        }
      }
    } catch (error) {
      console.error("Failed to analyze food photo:", error);
      setPhotoAnalysisError(
        (error && error.message) ||
          "Couldn't analyze food photo. You can still fill details manually."
      );
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPhoto(base64String);
        setPhotoPreview(base64String);
        identifyFoodFromPhoto(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    setPhotoPreview("");
  };

  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions or use upload instead.");
    }
  };

  const handleCapturePhoto = () => {
    const video = document.getElementById('camera-video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const base64String = canvas.toDataURL('image/jpeg', 0.8);
    setPhoto(base64String);
    setPhotoPreview(base64String);
    identifyFoodFromPhoto(base64String);
    handleCloseCamera();
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  useEffect(() => {
    if (showCamera && cameraStream) {
      const video = document.getElementById('camera-video');
      if (video) {
        video.srcObject = cameraStream;
        video.play();
      }
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, cameraStream]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const donationData = {
        donorName,
        contactPerson,
        email,
        phone,
        foodType,
        foodDescription,
        quantity: Number(quantity),
        quantityUnit,
        packaging,
        expiryDateTime: new Date(expiryDateTime).toISOString(),
        foodNotes,
        pickupAddress,
        city,
        pincode,
        pickupDateTime: new Date(pickupDateTime).toISOString(),
        pickupInstructions,
        donationPreference,
        photo,
      };

      await donationsAPI.create(donationData);

      // Reset form
      setDonorName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setFoodType("");
      setFoodDescription("");
      setQuantity("");
      setQuantityUnit("portions");
      setPackaging("");
      setExpiryDateTime("");
      setFoodNotes("");
      setPickupAddress("");
      setCity("");
      setPincode("");
      setPickupDateTime("");
      setPickupInstructions("");
      setDonationPreference("Any NGO");
      setPhoto("");
      setPhotoPreview("");

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(null), 6000);
    } catch (error) {
      console.error("Failed to submit donation:", error);
      setSubmitError(error.message || "Failed to submit donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Donate Surplus Food 🍱</h1>
      <p className="page-intro">
        Share surplus food so NGOs can collect and distribute it to those in need.
      </p>

      {submitSuccess && (
        <div className="submit-success-banner">
          <span className="submit-success-icon">✓</span>
          <div>
            <strong>Donation submitted!</strong> Your listing is now on the Available Foods page. NGOs can view and request it.
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
        {/* Photo Upload */}
        <section className="ngo-form-section" style={sectionStyle}>
          <h2 className="ngo-form-section-title">
            Food Photo (Optional)
          </h2>
          <div style={{ 
            display: "flex", 
            gap: "12px", 
            flexWrap: "wrap",
            marginBottom: "16px",
            alignItems: "stretch"
          }}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
              id="photo-upload"
            />
            <label htmlFor="photo-upload" style={{ 
              flex: "1 1 calc(50% - 6px)",
              padding: "14px 20px",
              background: "rgba(255, 106, 0, 0.2)",
              border: "2px dashed rgba(255, 106, 0, 0.5)",
              borderRadius: "12px",
              cursor: "pointer",
              color: "#ff9a44",
              fontWeight: "600",
              textAlign: "center",
              transition: "all 0.3s",
              minWidth: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50px",
              boxSizing: "border-box",
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
              margin: 0,
              outline: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 106, 0, 0.3)";
              e.target.style.borderColor = "rgba(255, 106, 0, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 106, 0, 0.2)";
              e.target.style.borderColor = "rgba(255, 106, 0, 0.5)";
            }}>
              📁 Upload Photo
            </label>
            <button
              type="button"
              onClick={handleTakePhoto}
              style={{ 
                flex: "1 1 calc(50% - 6px)",
                padding: "14px 20px",
                background: "rgba(34, 197, 94, 0.2)",
                border: "2px dashed rgba(34, 197, 94, 0.5)",
                borderRadius: "12px",
                cursor: "pointer",
                color: "#22c55e",
                fontWeight: "600",
                textAlign: "center",
                transition: "all 0.3s",
                minWidth: "150px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50px",
                boxSizing: "border-box",
                fontFamily: "inherit",
                fontSize: "inherit",
                lineHeight: "inherit",
                margin: 0,
                outline: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(34, 197, 94, 0.3)";
                e.target.style.borderColor = "rgba(34, 197, 94, 0.7)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(34, 197, 94, 0.2)";
                e.target.style.borderColor = "rgba(34, 197, 94, 0.5)";
              }}
            >
              📷 Take Photo
            </button>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "8px" }}>
            Upload from device or take a photo with your camera (max 5MB)
          </p>
          {isAnalyzingPhoto && (
            <p style={{ fontSize: "0.85rem", color: "#c4b5fd", marginTop: "4px" }}>
              Analyzing your photo with Foodie Finder AI...
            </p>
          )}
          {photoAnalysisError && (
            <p style={{ fontSize: "0.85rem", color: "#fecaca", marginTop: "4px" }}>
              {photoAnalysisError}
            </p>
          )}
          {photoAnalysisResult && !photoAnalysisError && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "rgba(15,23,42,0.7)",
                border: "1px solid rgba(129,140,248,0.5)",
                color: "#e2e8f0",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                AI detected from photo:
              </div>
              {photoAnalysisResult.name && (
                <div>
                  <strong>Food:</strong> {photoAnalysisResult.name}
                </div>
              )}
              {photoAnalysisResult.quantity_kg && (
                <div>
                  <strong>Estimated quantity:</strong>{" "}
                  {photoAnalysisResult.quantity_kg}
                </div>
              )}
              {photoAnalysisResult.expiry_estimate && (
                <div>
                  <strong>Approx expiry:</strong>{" "}
                  {photoAnalysisResult.expiry_estimate}
                </div>
              )}
            </div>
          )}
          {photoPreview && (
            <div style={{ 
              marginTop: "16px",
              position: "relative",
              display: "inline-block"
            }}>
              <img 
                src={photoPreview} 
                alt="Food preview" 
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "12px",
                  border: "2px solid rgba(255, 106, 0, 0.3)",
                  objectFit: "cover"
                }}
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(239, 68, 68, 0.9)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                }}
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          )}
        </section>

        {/* Camera Modal */}
        {showCamera && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}>
            <div style={{
              width: "100%",
              maxWidth: "500px",
              background: "#1e293b",
              borderRadius: "16px",
              padding: "20px",
              position: "relative"
            }}>
              <button
                type="button"
                onClick={handleCloseCamera}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(239, 68, 68, 0.8)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  fontSize: "20px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10001
                }}
                aria-label="Close camera"
              >
                ×
              </button>
              <h3 style={{ 
                color: "white", 
                marginBottom: "16px",
                textAlign: "center"
              }}>
                Take Photo
              </h3>
              <video
                id="camera-video"
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  background: "#000"
                }}
              />
              <div style={{
                display: "flex",
                gap: "12px",
                marginTop: "16px",
                justifyContent: "center"
              }}>
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  style={{
                    padding: "12px 24px",
                    background: "rgba(100, 116, 139, 0.3)",
                    border: "1px solid rgba(100, 116, 139, 0.5)",
                    borderRadius: "8px",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  style={{
                    padding: "12px 24px",
                    background: "#22c55e",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
                  }}
                >
                  📸 Capture
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Donor / contact details */}
        <section className="ngo-form-section" style={sectionStyle}>
          <h2 className="ngo-form-section-title">
            Your details
          </h2>
          <label>Donor name or organization *</label>
          <input
            type="text"
            placeholder="e.g. ABC Restaurant / Your name"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
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
            placeholder="email@example.com"
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
        </section>

        {/* Food donation details */}
        <section className="ngo-form-section" style={sectionStyle}>
          <h2 className="ngo-form-section-title">
            Food donation details
          </h2>
          <label>Type of food *</label>
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
            <option value="Mixed/Other">Mixed / Other</option>
          </select>
          <label>Food item description *</label>
          <input
            type="text"
            placeholder="e.g. Rice, dal, mixed sabzi, roti"
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            required
          />
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
          <label>Packaging (optional)</label>
          <input
            type="text"
            placeholder="e.g. In containers, sealed packets"
            value={packaging}
            onChange={(e) => setPackaging(e.target.value)}
          />
          <label>Best before / Expiry date & time *</label>
          <input
            type="datetime-local"
            value={expiryDateTime}
            onChange={(e) => setExpiryDateTime(e.target.value)}
            required
          />
          <label>Special notes (optional)</label>
          <textarea
            placeholder="e.g. Vegetarian, contains nuts, refrigerate"
            value={foodNotes}
            onChange={(e) => setFoodNotes(e.target.value)}
            rows={2}
          />
        </section>

        {/* Pickup / delivery */}
        <section className="ngo-form-section" style={sectionStyle}>
          <h2 className="ngo-form-section-title">
            Pickup details
          </h2>
          <label>Full pickup address *</label>
          <textarea
            placeholder="Street, area, landmark"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
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
          <label>Preferred pickup date & time *</label>
          <input
            type="datetime-local"
            value={pickupDateTime}
            onChange={(e) => setPickupDateTime(e.target.value)}
            required
          />
          <label>Instructions for pickup (optional)</label>
          <textarea
            placeholder="e.g. Ring the bell, ask for kitchen"
            value={pickupInstructions}
            onChange={(e) => setPickupInstructions(e.target.value)}
            rows={2}
          />
        </section>

        {/* Preference */}
        <section className="ngo-form-section" style={sectionStyle}>
          <h2 className="ngo-form-section-title">
            Preference (optional)
          </h2>
          <label>Prefer to donate to</label>
          <select
            value={donationPreference}
            onChange={(e) => setDonationPreference(e.target.value)}
          >
            <option value="Any NGO">Any NGO</option>
            <option value="Children / schools">Children / schools</option>
            <option value="Elderly / care homes">Elderly / care homes</option>
            <option value="Disaster relief">Disaster relief</option>
            <option value="Daily feeding programs">Daily feeding programs</option>
          </select>
        </section>

        <button type="submit" className="ngo-form-submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit donation"}
        </button>
      </form>
    </div>
  );
}

export default Donor;
