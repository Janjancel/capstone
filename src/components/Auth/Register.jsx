

// // src/components/Auth/RegisterForm.jsx
// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   TextField,
//   IconButton,
//   InputAdornment,
//   CircularProgress,
//   Divider,
//   Typography,
// } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import Swal from "sweetalert2";
// import axios from "axios";
// import { GoogleLogin } from "@react-oauth/google";
// // import jwtDecode from "jwt-decode"; // <-- CORRECT import
// import {jwtDecode} from "jwt-decode";
// import toast from "react-hot-toast";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// export default function RegisterForm({ onSuccess, toggleMode }) {
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const navigate = useNavigate();
//   const { setUser } = useAuth();

//   const formik = useFormik({
//     initialValues: {
//       username: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     },
//     validationSchema: Yup.object({
//       username: Yup.string().min(3, "Too short").required("Username is required"),
//       email: Yup.string().email("Invalid email").required("Email is required"),
//       password: Yup.string()
//         .matches(
//           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{6,}$/,
//           "Password too weak"
//         )
//         .required("Password is required"),
//       confirmPassword: Yup.string()
//         .oneOf([Yup.ref("password")], "Passwords must match")
//         .required("Please confirm password"),
//     }),
//     onSubmit: async (values, { setSubmitting, resetForm, setFieldError }) => {
//       setLoading(true);
//       try {
//         // Only send the required fields to the server
//         const payload = {
//           username: values.username,
//           email: values.email,
//           password: values.password,
//         };

//         const apiUrl = process.env.REACT_APP_API_URL || "";

//         await axios.post(`${apiUrl}/api/auth/register`, payload, {
//           headers: { "Content-Type": "application/json" },
//         });

//         Swal.fire(
//           "Registration Successful",
//           "Check your email to verify your account before logging in.",
//           "success"
//         );

//         resetForm();
//         // switch to login form if provided
//         if (typeof toggleMode === "function") toggleMode();
//       } catch (err) {
//         const msg = err?.response?.data?.message || err.message || "Something went wrong.";
//         // map likely errors
//         if (msg.toLowerCase().includes("email")) setFieldError("email", msg);
//         if (msg.toLowerCase().includes("username")) setFieldError("username", msg);

//         Swal.fire("Error", msg, "error");
//       } finally {
//         setSubmitting(false);
//         setLoading(false);
//       }
//     },
//   });

//   const handleGoogleSuccess = async (credentialResponse) => {
//     try {
//       if (!credentialResponse?.credential) throw new Error("No credential received");

//       // decode the credential safely (jwtDecode is default import)
//       const decoded = jwtDecode(credentialResponse.credential);

//       const apiUrl = process.env.REACT_APP_API_URL || "";

//       const { data } = await axios.post(
//         `${apiUrl}/api/auth/google`,
//         { token: credentialResponse.credential },
//         { headers: { "Content-Type": "application/json" } }
//       );

//       const { token, user } = data;

//       // persist token and user id
//       if (token) localStorage.setItem("token", token);
//       if (user?._id) localStorage.setItem("userId", user._id);

//       if (typeof setUser === "function") setUser(user);

//       // navigate according to role
//       navigate(user?.role === "admin" ? "/admin" : "/", { replace: true });

//       toast.success(`Welcome, ${user?.username || decoded?.name || "User"}!`);
//     } catch (err) {
//       console.error("Google login failed:", err);
//       toast.error(err?.response?.data?.message || err?.message || "Google login failed.");
//     }
//   };

//   const handleGoogleFailure = () => {
//     toast.error("Google login cancelled or failed.");
//   };

//   return (
//     <Box
//       component="form"
//       onSubmit={formik.handleSubmit}
//       sx={{ maxWidth: 400, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}
//     >
//       {/* Username */}
//       <TextField
//         fullWidth
//         label="Username"
//         name="username"
//         {...formik.getFieldProps("username")}
//         error={formik.touched.username && Boolean(formik.errors.username)}
//         helperText={formik.touched.username && formik.errors.username}
//       />

//       {/* Email */}
//       <TextField
//         fullWidth
//         label="Email"
//         name="email"
//         type="email"
//         {...formik.getFieldProps("email")}
//         error={formik.touched.email && Boolean(formik.errors.email)}
//         helperText={formik.touched.email && formik.errors.email}
//       />

//       {/* Password */}
//       <TextField
//         fullWidth
//         label="Password"
//         name="password"
//         type={showPassword ? "text" : "password"}
//         {...formik.getFieldProps("password")}
//         error={formik.touched.password && Boolean(formik.errors.password)}
//         helperText={formik.touched.password && formik.errors.password}
//         InputProps={{
//           endAdornment: (
//             <InputAdornment position="end">
//               <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
//                 {showPassword ? <VisibilityOff /> : <Visibility />}
//               </IconButton>
//             </InputAdornment>
//           ),
//         }}
//       />

//       {/* Confirm Password */}
//       <TextField
//         fullWidth
//         label="Confirm Password"
//         name="confirmPassword"
//         type={showConfirmPassword ? "text" : "password"}
//         {...formik.getFieldProps("confirmPassword")}
//         error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
//         helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
//         InputProps={{
//           endAdornment: (
//             <InputAdornment position="end">
//               <IconButton
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 edge="end"
//               >
//                 {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
//               </IconButton>
//             </InputAdornment>
//           ),
//         }}
//       />

//       {/* Register Button */}
//       <Button
//         type="submit"
//         variant="contained"
//         sx={{
//           backgroundColor: "black",
//           color: "white",
//           "&:hover": { backgroundColor: "#222" },
//         }}
//         fullWidth
//         disabled={formik.isSubmitting || loading}
//         startIcon={loading ? <CircularProgress size={20} /> : undefined}
//       >
//         {loading ? "Registering..." : "Register"}
//       </Button>

//       {/* Divider */}
//       <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
//         <Divider sx={{ flexGrow: 1 }} />
//         <Typography sx={{ mx: 2, color: "text.secondary" }}>or</Typography>
//         <Divider sx={{ flexGrow: 1 }} />
//       </Box>

//       {/* Google Login */}
//       <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
//         <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
//       </Box>

//       {/* Toggle to Login */}
//       <Typography align="center">
//         Already have an account?{" "}
//         <Box
//           component="span"
//           sx={{ color: "primary.main", cursor: "pointer", fontWeight: "bold" }}
//           onClick={toggleMode}
//         >
//           Login
//         </Box>
//       </Typography>
//     </Box>
//   );
// }


import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
// Some builds of jwt-decode export a named export; adjust based on your package
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterForm({ onSuccess, toggleMode }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth?.() || {};

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().min(3, "Too short").required("Username is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{6,}$/,
          "Password too weak"
        )
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm password"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm, setFieldError }) => {
      setLoading(true);
      try {
        const payload = {
          username: values.username,
          email: values.email,
          password: values.password,
        };

        const apiUrl = process.env.REACT_APP_API_URL || "";

        const { data } = await axios.post(`${apiUrl}/api/auth/register`, payload, {
          headers: { "Content-Type": "application/json" },
        });

        Swal.fire("Registration Successful", "You can now log in.", "success");

        // optionally persist token and user
        if (data?.token) localStorage.setItem("token", data.token);
        if (data?.user?._id) localStorage.setItem("userId", data.user._id);
        if (typeof setUser === "function") setUser(data.user);

        resetForm();

        // call onSuccess if provided
        if (typeof onSuccess === "function") onSuccess(data);

        // toggle to login or navigate
        if (typeof toggleMode === "function") toggleMode();
        else navigate("/", { replace: true });
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Something went wrong.";
        if (msg.toLowerCase().includes("email")) setFieldError("email", msg);
        if (msg.toLowerCase().includes("username")) setFieldError("username", msg);
        Swal.fire("Error", msg, "error");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) throw new Error("No credential received");
      // decode the credential safely
      const decoded = jwtDecode(credentialResponse.credential);

      const apiUrl = process.env.REACT_APP_API_URL || "";

      const { data } = await axios.post(
        `${apiUrl}/api/auth/google`,
        { token: credentialResponse.credential },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token, user } = data || {};

      if (token) localStorage.setItem("token", token);
      if (user?._id) localStorage.setItem("userId", user._id);
      if (typeof setUser === "function") setUser(user);

      navigate(user?.role === "admin" ? "/admin" : "/", { replace: true });
      toast.success(`Welcome, ${user?.username || decoded?.name || "User"}!`);
    } catch (err) {
      console.error("Google login failed:", err);
      toast.error(err?.response?.data?.message || err?.message || "Google login failed.");
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google login cancelled or failed.");
  };

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{ maxWidth: 400, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <TextField
        fullWidth
        label="Username"
        name="username"
        {...formik.getFieldProps("username")}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
      />

      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        {...formik.getFieldProps("email")}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />

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

      <TextField
        fullWidth
        label="Confirm Password"
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        {...formik.getFieldProps("confirmPassword")}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: "black",
          color: "white",
          "&:hover": { backgroundColor: "#222" },
        }}
        fullWidth
        disabled={formik.isSubmitting || loading}
        startIcon={loading ? <CircularProgress size={20} /> : undefined}
      >
        {loading ? "Registering..." : "Register"}
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
        <Divider sx={{ flexGrow: 1 }} />
        <Typography sx={{ mx: 2, color: "text.secondary" }}>or</Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
      </Box>

      <Typography align="center">
        Already have an account?{" "}
        <Box
          component="span"
          sx={{ color: "primary.main", cursor: "pointer", fontWeight: "bold" }}
          onClick={toggleMode}
        >
          Login
        </Box>
      </Typography>
    </Box>
  );
}
