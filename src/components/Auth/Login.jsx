
// import React, { useState } from "react";
// import {
//   Box,
//   TextField,
//   IconButton,
//   InputAdornment,
//   Button,
//   CircularProgress,
//   Divider,
//   Typography,
// } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { GoogleLogin } from "@react-oauth/google";
// import { jwtDecode } from "jwt-decode";
// import ForgotPassword from "./ForgotPassword";
// import { useAuth } from "../../context/AuthContext";

// export default function LoginForm({ onSuccess, toggleMode }) {
//   const navigate = useNavigate();
//   const { setUser } = useAuth();

//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showForgotModal, setShowForgotModal] = useState(false);
//   const [attempts, setAttempts] = useState(0);

//   const formik = useFormik({
//     initialValues: { email: "", password: "" },
//     validationSchema: Yup.object({
//       email: Yup.string().required("Email or Username is required"),
//       password: Yup.string().required("Password is required"),
//     }),
//     onSubmit: async (values, { setSubmitting, resetForm }) => {
//       setLoading(true);
//       try {
//         const res = await axios.post(
//           `${process.env.REACT_APP_API_URL}/api/auth/login`,
//           {
//             identifier: values.email,
//             password: values.password,
//           }
//         );

//         const { token, user } = res.data;
//         if (!token || !user) throw new Error("Invalid login response from server.");

//         localStorage.setItem("token", token);
//         localStorage.setItem("userId", user._id);

//         setUser(user);
//         toast.success(`Welcome back, ${user.username || "User"}!`);

//         navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
//         onSuccess?.();
//       } catch (err) {
//         const msg = err?.response?.data?.message;
//         if (msg?.toLowerCase().includes("not verified")) {
//           toast.error("Please verify your email before logging in.");
//         } else {
//           toast.error(msg || "Login failed. Please try again.");
//         }

//         setAttempts((prev) => {
//           const updated = prev + 1;
//           if (updated >= 3) setShowForgotModal(true);
//           return updated;
//         });
//       } finally {
//         setSubmitting(false);
//         setLoading(false);
//         resetForm();
//       }
//     },
//   });

//   const handleGoogleSuccess = async (credentialResponse) => {
//     try {
//       if (!credentialResponse?.credential) throw new Error("No credential received");

//       const decoded = jwtDecode(credentialResponse.credential);

//       const res = await axios.post(
//         `${process.env.REACT_APP_API_URL}/api/auth/google`,
//         { token: credentialResponse.credential }
//       );

//       const { token, user } = res.data;

//       localStorage.setItem("token", token);
//       localStorage.setItem("userId", user._id);

//       setUser(user);
//       navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
//       toast.success(`Welcome, ${user.username || decoded.name || "User"}!`);
//     } catch (err) {
//       console.error("Google login failed:", err);
//       toast.error(err?.response?.data?.message || "Google login failed.");
//     }
//   };

//   const handleGoogleFailure = () => {
//     toast.error("Google login cancelled or failed.");
//   };

//   return (
//     <>
//       <Box
//         component="form"
//         onSubmit={formik.handleSubmit}
//         sx={{ maxWidth: 400, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}
//       >
//         {/* Email */}
//         <TextField
//           fullWidth
//           label="Email or Username"
//           name="email"
//           {...formik.getFieldProps("email")}
//           error={formik.touched.email && Boolean(formik.errors.email)}
//           helperText={formik.touched.email && formik.errors.email}
//         />

//         {/* Password */}
//         <TextField
//           fullWidth
//           label="Password"
//           name="password"
//           type={showPassword ? "text" : "password"}
//           {...formik.getFieldProps("password")}
//           error={formik.touched.password && Boolean(formik.errors.password)}
//           helperText={formik.touched.password && formik.errors.password}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
//                   {showPassword ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />

//         {/* Forgot Password */}
//         {attempts >= 3 && (
//           <Typography
//             variant="body2"
//             align="right"
//             sx={{ color: "primary.main", cursor: "pointer", textDecoration: "underline" }}
//             onClick={() => setShowForgotModal(true)}
//           >
//             Forgot Password?
//           </Typography>
//         )}

//         {/* Login Button */}
//         <Button
//           type="submit"
//           fullWidth
//           variant="contained"
//           sx={{
//             backgroundColor: "black",
//             color: "white",
//             "&:hover": { backgroundColor: "#222" },
//           }}
//           disabled={formik.isSubmitting || loading}
//           startIcon={loading && <CircularProgress size={20} />}
//         >
//           {loading ? "Logging in..." : "Login"}
//         </Button>

//         {/* Divider */}
//         <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
//           <Divider sx={{ flexGrow: 1 }} />
//           <Typography sx={{ mx: 2, color: "text.secondary" }}>or</Typography>
//           <Divider sx={{ flexGrow: 1 }} />
//         </Box>

//         {/* Google Login */}
//         <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
//           <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
//         </Box>

//         {/* Toggle to Register */}
//         <Typography align="center">
//           Don’t have an account?{" "}
//           <Box
//             component="span"
//             sx={{ color: "primary.main", cursor: "pointer", fontWeight: "bold" }}
//             onClick={toggleMode}
//           >
//             Register
//           </Box>
//         </Typography>
//       </Box>

//       {/* Forgot Password Modal */}
//       <ForgotPassword show={showForgotModal} onHide={() => setShowForgotModal(false)} />
//     </>
//   );
// }


import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import ForgotPassword from "./ForgotPassword";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm({ onSuccess, toggleMode }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().required("Email or Username is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setLoading(true);
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/login`,
          {
            identifier: values.email,
            password: values.password,
          }
        );

        const { token, user } = res.data;
        if (!token || !user) throw new Error("Invalid login response from server.");

        localStorage.setItem("token", token);
        localStorage.setItem("userId", user._id);

        // update auth context
        setUser?.(user);
        toast.success(`Welcome back, ${user.username || "User"}!`);

        // Close modal (parent) and navigate
        onSuccess?.();
        navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
      } catch (err) {
        const msg = err?.response?.data?.message;
        if (msg?.toLowerCase().includes("not verified")) {
          toast.error("Please verify your email before logging in.");
        } else {
          toast.error(msg || "Login failed. Please try again.");
        }

        setAttempts((prev) => {
          const updated = prev + 1;
          if (updated >= 3) setShowForgotModal(true);
          return updated;
        });
      } finally {
        setSubmitting(false);
        setLoading(false);
        resetForm();
      }
    },
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) throw new Error("No credential received");

      // decode (used only for display fallback)
      let decoded = null;
      try {
        decoded = jwtDecode(credentialResponse.credential);
      } catch (e) {
        // ignore decode error, not critical
        decoded = null;
      }

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google`,
        { token: credentialResponse.credential }
      );

      const { token, user } = res.data;
      if (!token || !user) throw new Error("Invalid response from server.");

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);

      setUser?.(user);
      toast.success(`Welcome, ${user.username || decoded?.name || "User"}!`);

      // Close modal and navigate
      onSuccess?.();
      navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      console.error("Google login failed:", err);
      toast.error(err?.response?.data?.message || "Google login failed.");
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google login cancelled or failed.");
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ maxWidth: 400, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}
      >
        {/* Email */}
        <TextField
          fullWidth
          label="Email or Username"
          name="email"
          {...formik.getFieldProps("email")}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />

        {/* Password */}
        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          {...formik.getFieldProps("password")}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Forgot Password */}
        {attempts >= 3 && (
          <Typography
            variant="body2"
            align="right"
            sx={{ color: "primary.main", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => setShowForgotModal(true)}
          >
            Forgot Password?
          </Typography>
        )}

        {/* Login Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: "black",
            color: "white",
            "&:hover": { backgroundColor: "#222" },
          }}
          disabled={formik.isSubmitting || loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        {/* Divider */}
        <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography sx={{ mx: 2, color: "text.secondary" }}>or</Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>

        {/* Google Login */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
        </Box>

        {/* Toggle to Register */}
        <Typography align="center">
          Don’t have an account?{" "}
          <Box
            component="span"
            sx={{ color: "primary.main", cursor: "pointer", fontWeight: "bold" }}
            onClick={toggleMode}
          >
            Register
          </Box>
        </Typography>
      </Box>

      {/* Forgot Password Modal */}
      <ForgotPassword show={showForgotModal} onHide={() => setShowForgotModal(false)} />
    </>
  );
}
