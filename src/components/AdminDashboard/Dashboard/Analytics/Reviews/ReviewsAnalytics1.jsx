import React, { useMemo } from "react";
import { Card } from "react-bootstrap";

export default function ReviewsAnalytics1({ reviews = [] }) {
  const data = useMemo(() => {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach((review) => {
      const rating = Math.round(Number(review.rating || 0));
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++;
        totalRating += rating;
      }
    });

    return {
      averageRating: reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }, [reviews]);

  return (
    <Card className="shadow-sm mb-3">
      <Card.Header style={{ backgroundColor: "#f8f9fa", fontWeight: "600" }}>
        Average Rating & Distribution
      </Card.Header>
      <Card.Body>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "36px", fontWeight: "bold", color: "#4e79a7" }}>
            {data.averageRating}⭐
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>
            Based on {data.totalReviews} reviews
          </div>
        </div>

        <div>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.ratingDistribution[star];
            const percentage = data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;

            return (
              <div key={star} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "500" }}>{star}⭐</span>
                  <span style={{ fontSize: "12px", color: "#999" }}>{count} ({percentage.toFixed(0)}%)</span>
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
                      width: `${percentage}%`,
                      height: "100%",
                      backgroundColor: star >= 4 ? "#27ae60" : star === 3 ? "#f39c12" : "#e74c3c",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
}
