import React, { useMemo } from "react";
import { Card } from "react-bootstrap";

export default function ReviewsAnalytics3({ reviews = [] }) {
  const data = useMemo(() => {
    if (reviews.length === 0) {
      return {
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
        positivePercent: 0,
        neutralPercent: 0,
        negativePercent: 0,
      };
    }

    let positive = 0;
    let neutral = 0;
    let negative = 0;

    reviews.forEach((review) => {
      const rating = Number(review.rating || 0);
      if (rating >= 4) positive++;
      else if (rating === 3) neutral++;
      else negative++;
    });

    const total = reviews.length;

    return {
      positiveCount: positive,
      neutralCount: neutral,
      negativeCount: negative,
      positivePercent: total > 0 ? (positive / total) * 100 : 0,
      neutralPercent: total > 0 ? (neutral / total) * 100 : 0,
      negativePercent: total > 0 ? (negative / total) * 100 : 0,
    };
  }, [reviews]);

  return (
    <Card className="shadow-sm mb-3">
      <Card.Header style={{ backgroundColor: "#f8f9fa", fontWeight: "600" }}>
        Sentiment Analysis
      </Card.Header>
      <Card.Body>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "20px" }}>
          {/* Positive */}
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "8px" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#27ae60" }}>
              {data.positiveCount}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              Positive ({data.positivePercent.toFixed(0)}%)
            </div>
          </div>

          {/* Neutral */}
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#fff3e0", borderRadius: "8px" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f39c12" }}>
              {data.neutralCount}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              Neutral ({data.neutralPercent.toFixed(0)}%)
            </div>
          </div>

          {/* Negative */}
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#ffebee", borderRadius: "8px" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#e74c3c" }}>
              {data.negativeCount}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              Negative ({data.negativePercent.toFixed(0)}%)
            </div>
          </div>
        </div>

        <div>
          {/* Positive Bar */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "4px" }}>
              Positive (4⭐-5⭐)
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e8e8e8",
              borderRadius: "4px",
              overflow: "hidden",
            }}>
              <div
                style={{
                  width: `${data.positivePercent}%`,
                  height: "100%",
                  backgroundColor: "#27ae60",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Neutral Bar */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "4px" }}>
              Neutral (3⭐)
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e8e8e8",
              borderRadius: "4px",
              overflow: "hidden",
            }}>
              <div
                style={{
                  width: `${data.neutralPercent}%`,
                  height: "100%",
                  backgroundColor: "#f39c12",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Negative Bar */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "4px" }}>
              Negative (1⭐-2⭐)
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e8e8e8",
              borderRadius: "4px",
              overflow: "hidden",
            }}>
              <div
                style={{
                  width: `${data.negativePercent}%`,
                  height: "100%",
                  backgroundColor: "#e74c3c",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
