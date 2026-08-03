import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Donor from "./pages/Donor";
import NGO from "./pages/NGO";
import AvailableFoods from "./pages/AvailableFoods";
import TrustedNGOs from "./pages/TrustedNGOs";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <div className={darkMode ? "dark app" : "app"}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donor" element={<Donor />} />
          <Route path="/ngo" element={<NGO />} />
          <Route path="/foods" element={<AvailableFoods />} />
          <Route path="/trusted-ngos" element={<TrustedNGOs />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
        <Chatbot />
      </div>
    </BrowserRouter>
  );
}

export default App;






