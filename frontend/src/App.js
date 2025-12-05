import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";

function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Welcome to Academic Calendar Frontend</h2>
      <p>This is the homepage. Use the navigation to go to login.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#eee" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;