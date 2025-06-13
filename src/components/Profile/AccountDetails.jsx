// src/components/AccountDetails.jsx

import React from "react";

const AccountDetails = ({ username, email }) => (
  <div className="card p-4 shadow-sm mb-4">
    <h4>Account Details</h4>
    <p><strong>Username:</strong> {username}</p>
    <p><strong>Email:</strong> {email}</p>
  </div>
);

export default AccountDetails;
