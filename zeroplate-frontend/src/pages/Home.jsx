import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>ZeroPlate 🍽️</h1>
          <p>
            Turning surplus food into hope.
            Connecting kitchens with communities.
          </p>

          <Link to="/donor" className="btn btn-primary">
            Donate Food
          </Link>

          <Link to="/ngo" className="btn btn-secondary">
            Join as NGO
          </Link>

          <Link to="/foods" className="btn btn-outline">
            View Available Foods
          </Link>

          <Link to="/trusted-ngos" className="btn btn-outline">
            NGO Requests
          </Link>

          <Link to="/leaderboard" className="btn btn-outline">
            Donor Leaderboard
          </Link>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose ZeroPlate?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092" />
            <h3>Smart Redistribution</h3>
            <p>Instantly connect surplus food with NGOs nearby.</p>
          </div>

          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836" />
            <h3>Real-Time Tracking</h3>
            <p>Monitor donation journey with live insights.</p>
          </div>

          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1464306076886-da185f6a9d05" />
            <h3>Impact Dashboard</h3>
            <p>Track meals served and impact created.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;



