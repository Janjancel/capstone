import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("🔒 Failed to restore user:", err);
        localStorage.clear();
        setUser(null);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
