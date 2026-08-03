import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">ZeroPlate 🍽️</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/leaderboard">Donor Leaderboard</Link>
        <Link to="/foods">Available Foods</Link>
        <Link to="/trusted-ngos">NGO Requests</Link>
        <Link to="/donor">Donate</Link>
        <Link to="/ngo">NGO</Link>
      </div>
    </nav>
  );
}


export default Navbar;

