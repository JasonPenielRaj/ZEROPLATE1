import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BOT_GREETING =
  "Hi! I'm the ZeroPlate assistant. Say 'I want to donate' to fill the donor form, or 'I'm an NGO' to fill the food request form. I'll collect your details and open the form for you. How can I help?";

const DONOR_STEPS = [
  { key: "donorName", question: "What's your name or organization name?" },
  { key: "contactPerson", question: "Contact person name?" },
  { key: "email", question: "Your email address?" },
  { key: "phone", question: "Phone number?" },
  { key: "foodType", question: "Type of food? (e.g. Cooked meals, Dry rations, Fresh vegetables, Fruits, Dairy, Packaged food, Mixed)" },
  { key: "foodDescription", question: "Short description of the food? (e.g. Rice, dal, mixed sabzi)" },
  { key: "quantity", question: "Quantity? (number only, e.g. 50)" },
  { key: "quantityUnit", question: "Unit? (kg / packets / boxes / portions)" },
  { key: "expiryDateTime", question: "Best before / expiry date and time? (e.g. 2025-02-20 14:00)" },
  { key: "pickupAddress", question: "Full pickup address? (street, area, landmark)" },
  { key: "city", question: "City?" },
  { key: "pincode", question: "Pincode?" },
  { key: "pickupDateTime", question: "Preferred pickup date and time? (e.g. 2025-02-20 14:00)" },
];

const NGO_STEPS = [
  { key: "ngoName", question: "NGO or organization name?" },
  { key: "contactPerson", question: "Contact person name?" },
  { key: "email", question: "Email address?" },
  { key: "phone", question: "Phone number?" },
  { key: "foodType", question: "Type of food needed? (e.g. Cooked meals, Dry rations, Fresh vegetables, Fruits, Dairy, Packaged food, Mixed)" },
  { key: "quantity", question: "Quantity needed? (number only)" },
  { key: "quantityUnit", question: "Unit? (kg / packets / boxes / portions)" },
  { key: "beneficiaries", question: "Number of beneficiaries (people to serve)?" },
  { key: "deliveryDateTime", question: "Preferred delivery date and time? (e.g. 2025-02-20 14:00)" },
  { key: "address", question: "Full delivery address? (street, area, landmark)" },
  { key: "city", question: "City?" },
  { key: "pincode", question: "Pincode?" },
  { key: "urgency", question: "Urgency? (Normal / High / Critical)" },
];

function getBotReply(userMessage, startDonorFlow, startNgoFlow) {
  const msg = userMessage.toLowerCase().trim();
  if (msg.includes("donate") || msg.includes("donor") || msg.includes("give food") || msg.includes("i want to donate")) {
    startDonorFlow();
    return "I'll help you fill the donor form. " + DONOR_STEPS[0].question;
  }
  if (msg.includes("ngo") || msg.includes("i'm an ngo") || msg.includes("request food") || msg.includes("we need food")) {
    startNgoFlow();
    return "I'll help you fill the NGO food request form. " + NGO_STEPS[0].question;
  }
  if (msg.includes("how") && (msg.includes("work") || msg.includes("works"))) {
    return "ZeroPlate connects surplus food from donors with NGOs who distribute it. You can donate via the form or tell me your details here and I'll open the form for you.";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! 👋 Say 'I want to donate' to fill the donor form, or 'I'm an NGO' to fill the request form. I'll prefill everything for you.";
  }
  if (msg.includes("thank") || msg.includes("thanks")) {
    return "You're welcome! Feel free to ask anything else.";
  }
  if (msg.includes("help") || msg.includes("what can you")) {
    return "I can collect your details and open the Donor or NGO form with everything filled. Say 'I want to donate' or 'I'm an NGO' to start.";
  }
  if (msg.includes("cancel") || msg.includes("stop") || msg.includes("nevermind")) {
    return "No problem. Say 'I want to donate' or 'I'm an NGO' whenever you're ready.";
  }
  return "Say 'I want to donate' to fill the donor form, or 'I'm an NGO' to fill the food request form. I'll collect your details and open the form for you.";
}

function normalizeDateTimeForStorage(v) {
  const s = String(v).trim();
  if (!s) return "";
  return s.replace(" ", "T").slice(0, 16);
}

function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: BOT_GREETING }]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const [flowMode, setFlowMode] = useState(null);
  const [donorStep, setDonorStep] = useState(0);
  const [ngoStep, setNgoStep] = useState(0);
  const [collectedDonor, setCollectedDonor] = useState({});
  const [collectedNgo, setCollectedNgo] = useState({});

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startDonorFlow = () => {
    setFlowMode("donating");
    setDonorStep(0);
    setCollectedDonor({});
  };

  const startNgoFlow = () => {
    setFlowMode("ngo");
    setNgoStep(0);
    setCollectedNgo({});
  };

  const openDonorForm = (data) => {
    const payload = {
      ...data,
      quantityUnit: data.quantityUnit || "portions",
      expiryDateTime: normalizeDateTimeForStorage(data.expiryDateTime),
      pickupDateTime: normalizeDateTimeForStorage(data.pickupDateTime),
      donationPreference: data.donationPreference || "Any NGO",
    };
    sessionStorage.setItem("zeroplate_donor_prefill", JSON.stringify(payload));
    setIsOpen(false);
    setTimeout(() => navigate("/donor"), 0);
  };

  const openNgoForm = (data) => {
    const payload = {
      ...data,
      quantityUnit: data.quantityUnit || "portions",
      deliveryDateTime: normalizeDateTimeForStorage(data.deliveryDateTime),
      urgency: data.urgency || "Normal",
    };
    sessionStorage.setItem("zeroplate_ngo_prefill", JSON.stringify(payload));
    setIsOpen(false);
    setTimeout(() => navigate("/ngo"), 0);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    if (flowMode === "donating") {
      const step = DONOR_STEPS[donorStep];
      const nextData = { ...collectedDonor, [step.key]: text };
      setCollectedDonor(nextData);

      if (donorStep + 1 < DONOR_STEPS.length) {
        setDonorStep(donorStep + 1);
        const nextQ = DONOR_STEPS[donorStep + 1].question;
        setTimeout(() => setMessages((prev) => [...prev, { role: "bot", text: nextQ }]), 300);
      } else {
        setFlowMode(null);
        setDonorStep(0);
        setTimeout(() => setMessages((prev) => [
          ...prev,
          { role: "bot", text: "I've got all the details. Open the donor form and they'll be filled for you." },
          { role: "bot", action: "open_donor", data: nextData },
        ]), 300);
      }
      return;
    }

    if (flowMode === "ngo") {
      const step = NGO_STEPS[ngoStep];
      const nextData = { ...collectedNgo, [step.key]: text };
      setCollectedNgo(nextData);

      if (ngoStep + 1 < NGO_STEPS.length) {
        setNgoStep(ngoStep + 1);
        const nextQ = NGO_STEPS[ngoStep + 1].question;
        setTimeout(() => setMessages((prev) => [...prev, { role: "bot", text: nextQ }]), 300);
      } else {
        setFlowMode(null);
        setNgoStep(0);
        setTimeout(() => setMessages((prev) => [
          ...prev,
          { role: "bot", text: "I've got all the details. Open the NGO form and they'll be filled for you." },
          { role: "bot", action: "open_ngo", data: nextData },
        ]), 300);
      }
      return;
    }

    const reply = getBotReply(text, startDonorFlow, startNgoFlow);
    setTimeout(() => setMessages((prev) => [...prev, { role: "bot", text: reply }]), 400);
  };

  return (
    <>
      <div className={`chatbot-panel ${isOpen ? "chatbot-panel-open" : ""}`}>
        <div className="chatbot-header">
          <span className="chatbot-title">ZeroPlate Assistant</span>
          <button type="button" className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
            ×
          </button>
        </div>
        <div className="chatbot-messages">
          {messages.map((m, i) => (
            <div key={i}>
              {m.action === "open_donor" ? (
                <div className="chatbot-msg chatbot-msg-bot chatbot-action">
                  <button type="button" className="chatbot-btn-open-form" onClick={() => openDonorForm(m.data)}>
                    Open Donor form with these details
                  </button>
                </div>
              ) : m.action === "open_ngo" ? (
                <div className="chatbot-msg chatbot-msg-bot chatbot-action">
                  <button type="button" className="chatbot-btn-open-form" onClick={() => openNgoForm(m.data)}>
                    Open NGO form with these details
                  </button>
                </div>
              ) : (
                <div className={`chatbot-msg chatbot-msg-${m.role}`}>
                  <span className="chatbot-msg-text">{m.text}</span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="chatbot-form" onSubmit={sendMessage}>
          <input
            type="text"
            className="chatbot-input"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="chatbot-send" aria-label="Send">
            Send
          </button>
        </form>
      </div>

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </>
  );
}

export default Chatbot;
