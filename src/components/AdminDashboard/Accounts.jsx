import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import Swal from "sweetalert2";
import { sendPasswordResetEmail } from "firebase/auth";

const AccountsDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAccounts(usersData);
        setFilteredAccounts(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setError("Failed to load account data.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const toggleStatus = async (account) => {
    const newStatus = account.status === "online" ? "offline" : "online";
    try {
      await updateDoc(doc(db, "users", account.id), { status: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleChangePassword = async (account) => {
    if (!account.email) {
      Swal.fire("Error", "No email associated with this user.", "error");
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
          await sendPasswordResetEmail(auth, account.email);
          Swal.fire("Sent!", "Password reset email has been sent.", "success");
        } catch (error) {
          console.error("Error sending reset email:", error);
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

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
                  <th>Image</th>
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
                    return (
                      <tr
                        key={account.id}
                        style={{
                          border: `2px solid ${isOnline ? "#28a745" : "#ccc"}`,
                          color: isOnline ? "#28a745" : "#6c757d",
                          fontWeight: 500,
                        }}
                      >
                        <td>
                          {account.profilePic ? (
                            <img
                              src={account.profilePic}
                              alt="profile"
                              style={{
                                width: 45,
                                height: 45,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid #ccc",
                              }}
                            />
                          ) : (
                            <span className="text-muted">No Image</span>
                          )}
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
