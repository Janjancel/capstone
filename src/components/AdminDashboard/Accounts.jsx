import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";

const AccountsDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const pollingRef = useRef(null);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      setAccounts(res.data);
      setFilteredAccounts(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load account data.");
      setLoading(false);
    }
  };

  const toggleStatus = async (account) => {
    const newStatus = account.status === "online" ? "offline" : "online";
    try {
      await axios.put(`${API_URL}/api/users/status/${account._id}`, {
        status: newStatus,
      });
      toast.success(`User marked as ${newStatus}`);
      fetchAccounts(); // refresh after toggle
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update user status.");
    }
  };

  const handleChangePassword = async (account) => {
    if (!account.email) {
      toast.error("No email associated with this user.");
      return;
    }

    Swal.fire({
      title: `Send password reset email to ${account.email}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Send Email",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`${API_URL}/api/auth/reset-password`, {
            email: account.email,
          });
          toast.success("Password reset email sent.");
        } catch (error) {
          console.error("Error sending reset email:", error);
          toast.error(error.response?.data?.message || error.message);
        }
      }
    });
  };

  useEffect(() => {
    fetchAccounts();

    pollingRef.current = setInterval(fetchAccounts, 3000); // poll every 3s
    return () => clearInterval(pollingRef.current);
  }, [API_URL]);

  useEffect(() => {
    const filtered = accounts.filter((account) =>
      account.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAccounts(filtered);
  }, [searchQuery, accounts]);

  return (
    <div className="container-fluid d-flex justify-content-center mt-4">
      <div className="bg-white p-4 rounded shadow" style={{ width: "90vw", maxHeight: "90vh" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Accounts Management</h2>
          <input
            type="text"
            className="form-control"
            placeholder="Search by username or email..."
            style={{ width: "250px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : (
          <div className="table-responsive" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <table className="table table-bordered text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Profile</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => {
                    const isOnline = account.status === "online";
                    const imageSrc = account.profilePic || "default-profile.png";

                    return (
                      <tr
                        key={account._id}
                        style={{
                          border: `2px solid ${isOnline ? "#28a745" : "#ccc"}`,
                          color: isOnline ? "#28a745" : "#6c757d",
                          fontWeight: 500,
                        }}
                      >
                        <td>
                          <div
                            className="rounded-circle overflow-hidden mx-auto"
                            style={{
                              width: 45,
                              height: 45,
                              borderRadius: "50%",
                              border: "1px solid #ccc",
                              backgroundColor: "#f0f0f0",
                            }}
                          >
                            <img
                              src={imageSrc}
                              alt="profile"
                              className="w-100 h-100"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        </td>
                        <td>{account.username || "N/A"}</td>
                        <td>{account.email || "N/A"}</td>
                        <td>{account.role || "client"}</td>
                        <td>
                          <span
                            onClick={() => toggleStatus(account)}
                            style={{ cursor: "pointer" }}
                            className={`badge px-3 py-1 ${isOnline ? "bg-success" : "bg-secondary"}`}
                            title="Click to toggle status"
                          >
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleChangePassword(account)}
                          >
                            Change Password
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-muted text-center">
                      No matching accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsDashboard;
