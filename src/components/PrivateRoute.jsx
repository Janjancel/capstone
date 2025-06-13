// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../firebase/AuthContext";

// const PrivateRoute = () => {
//   const { currentUser } = useAuth();

//   return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
// };

// export default PrivateRoute;

// PrivateRoute.jsx
// components/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Adjust path if needed

const PrivateRoute = () => {
  const { user } = useAuth();

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
