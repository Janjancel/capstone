import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardNavbar from "../DashboardNavbar";
import Sidebar from "../Sidebar/Sidebar";
import Items from "../Items/Items";
import Accounts from "../Accounts";
import Dashboard from "../Dashboard/Dashboard";
import SellRequests from "../Requests/SellDashboard/SellDashboard";
import DemolitionRequests from "../Requests/DemolishDashboard/DemolishDashboard";
import OrderDashboard from "../OrderDashboard";
import ReportDashboard from "../Reports/ReportDashboard";
import HeritageDashboard from "../HeritageDashboard/HeritageDashboard";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../App.css";

const Admin = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.role !== "admin") {
          navigate("/", { replace: true });
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("❌ Admin Auth Check Failed:", error);
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const userId = user?._id;
      if (userId) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, { userId });
      }
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container-fluid" id="Admin">
      <div className="d-flex vh-100 overflow-hidden">
        {sidebarOpen && (
          <div className="bg-light border-end" style={{ width: "200px" }}>
            <Sidebar />
          </div>
        )}

        <div className="flex-grow-1 overflow-auto position-relative">
          <DashboardNavbar
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />

          <div>
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="sellDashboard" element={<SellRequests />} />
              <Route path="demolishDashboard" element={<DemolitionRequests />} />
              <Route path="items" element={<Items />} />
              <Route path="orders" element={<OrderDashboard />} />
              <Route path="report" element={<ReportDashboard />} />
              <Route path="heritage" element={<HeritageDashboard />} />
              <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
