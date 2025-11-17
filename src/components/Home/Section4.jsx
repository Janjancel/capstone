import React, { useEffect, useState } from "react";
import axios from "axios";

function renderStars(value) {
  const v = Number(value) || 0;
  const full = Math.max(0, Math.min(5, Math.round(v)));
  const stars = [];
  for (let i = 0; i < full; i++) stars.push("★");
  for (let i = full; i < 5; i++) stars.push("☆");
  return stars.join(" ");
}

export default function Section4() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/$/, "")
    : "";

  useEffect(() => {
    let mounted = true;
    const fetchReviewsAndUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL || ""}/api/reviews`);
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];

        let userMap = {};

        try {
          const token = localStorage.getItem("token");
          const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
          const usersRes = await axios.get(`${API_URL || ""}/api/users`, config);
          const users = Array.isArray(usersRes.data) ? usersRes.data : [];
          users.forEach((u) => {
            if (u && u._id) userMap[String(u._id)] = u;
          });
        } catch (userErr) {
          console.warn("Could not fetch users to resolve emails:", userErr?.message || userErr);
          userMap = {};
        }

        const enriched = data.map((r) => ({
          ...r,
          userEmail: (r.userId && userMap[String(r.userId)] && userMap[String(r.userId)].email) || r.userEmail || null,
        }));

        const sorted = enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (mounted) setReviews(sorted.slice(0, 6));
      } catch (err) {
        console.error("Error fetching reviews:", err);
        if (mounted) setError("Failed to load reviews.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReviewsAndUsers();

    return () => {
      mounted = false;
    };
  }, [API_URL]);

  const formatDate = (d) => {
    if (!d) return "Unknown date";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <section className="py-5 bg-white" id="home-sec4">
      <div className="container">
        <div className="row mb-4">
          <div className="col-md-8">
            <h3 className="fw-bold">What people say</h3>
            <p className="text-muted">Real feedback from our buyers and sellers.</p>
          </div>
        </div>

        {loading ? (
          <div className="row">
            {[1, 2, 3].map((n) => (
              <div className="col-md-4 mb-3" key={n}>
                <div className="card p-3 shadow-sm rounded-3">
                  <div style={{ height: 90, background: "#f6f6f6", borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="row">
            <div className="col-12">
              <div className="alert alert-warning">{error}</div>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div
                className="card shadow-sm rounded-4 p-4"
                style={{ overflow: "hidden", border: "1px solid rgba(0,0,0,0.04)" }}
              >
                <div className="d-flex">
                  <div style={{ width: 180 }}>
                    <div
                      style={{
                        width: 84,
                        height: 84,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 24,
                        background: "linear-gradient(135deg,#f0e6dd,#d9cbb1)",
                        color: "#3b3b3b",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                        marginBottom: 12,
                      }}
                    >
                      UA
                    </div>

                    <div style={{ fontSize: 13, color: "#6c6c6c" }}>collector@unikaantika.com</div>
                  </div>

                  <div className="flex-grow-1 d-flex align-items-start" style={{ paddingLeft: 20 }}>
                    <div>
                      <div style={{ fontSize: 20, marginBottom: 8 }} aria-hidden>
                        <span style={{ marginRight: 6 }}>★</span>
                        <span style={{ marginRight: 6 }}>★</span>
                        <span style={{ marginRight: 6 }}>★</span>
                        <span style={{ marginRight: 6 }}>★</span>
                        <span style={{ marginRight: 6 }}>★</span>
                      </div>

                      <p style={{ margin: 0, color: "#444", fontSize: 16 }}>
                        Thank you for choosing us — your feedback helps us improve.
                      </p>

                      <div style={{ marginTop: 10, fontSize: 13, color: "#9a9a9a" }}>
                        <span>Posted on Nov 13, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {reviews.map((r) => (
              <div className="col-md-4" key={r._id || JSON.stringify(r).slice(0, 20)}>
                <div className="card p-3 h-100 shadow-sm rounded-3">
                  <div className="d-flex align-items-start">
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 18,
                        background: "#f2f2f2",
                        color: "#333",
                        marginRight: 12,
                        flexShrink: 0,
                      }}
                    >
                      {r.userId ? String(r.userId).slice(0, 2).toUpperCase() : "AN"}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>
                          {r.userEmail || "Anonymous"}
                        </div>
                        <div style={{ marginLeft: "auto", fontSize: 13, color: "#888" }}>
                          {formatDate(r.createdAt)}
                        </div>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <div aria-hidden style={{ fontSize: 18, color: "#f1b33b", marginBottom: 6 }}>
                          {renderStars(r.rating)}
                        </div>
                        <div style={{ color: "#444" }}>{r.feedback || <i>No feedback provided.</i>}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
