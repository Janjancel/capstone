// import React, { useState } from "react";
// import { Form, Button, InputGroup, Spinner } from "react-bootstrap";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
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
//         const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
//           identifier: values.email,
//           password: values.password,
//         });

//         const { token, user } = res.data;

//         if (!token || !user) {
//           throw new Error("Invalid login response from server.");
//         }

//         // Store in localStorage
//         localStorage.setItem("token", token);
//         localStorage.setItem("userId", user._id);

//         // Set global auth context
//         setUser(user);

//         toast.success(`Welcome back, ${user.username || "User"}!`);

//         // Role-based redirect
//         if (user.role === "admin") {
//           navigate("/admin", { replace: true });
//         } else {
//           navigate("/", { replace: true });
//         }

//         onSuccess?.();
//       } catch (err) {
//   const msg = err?.response?.data?.message;

//   if (msg?.toLowerCase().includes("not verified")) {
//     toast.error("Please verify your email before logging in.");
//   } else {
//     toast.error(msg || "Login failed. Please try again.");
//   }

//   setAttempts((prev) => {
//     const updated = prev + 1;
//     if (updated >= 3) setShowForgotModal(true);
//     return updated;
//   });
// }
//  finally {
//         setSubmitting(false);
//         setLoading(false);
//         resetForm();
//       }
//     },
//   });

//   return (
//     <>
//       <Form onSubmit={formik.handleSubmit}>
//         <Form.Group className="mb-3">
//           <Form.Control
//             type="text"
//             name="email"
//             placeholder="Email or Username"
//             {...formik.getFieldProps("email")}
//             isInvalid={formik.touched.email && formik.errors.email}
//           />
//           <Form.Control.Feedback type="invalid">
//             {formik.errors.email}
//           </Form.Control.Feedback>
//         </Form.Group>

//         <InputGroup className="mb-1">
//           <Form.Control
//             type={showPassword ? "text" : "password"}
//             name="password"
//             placeholder="Password"
//             {...formik.getFieldProps("password")}
//             isInvalid={formik.touched.password && formik.errors.password}
//           />
//           <Button
//             variant="outline-secondary"
//             onClick={() => setShowPassword(!showPassword)}
//             tabIndex={-1}
//           >
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </Button>
//           <Form.Control.Feedback type="invalid">
//             {formik.errors.password}
//           </Form.Control.Feedback>
//         </InputGroup>

//         {attempts >= 3 && (
//           <div className="text-end mt-1 mb-2">
//             <span
//               className="text-primary"
//               role="button"
//               style={{ cursor: "pointer", fontSize: "0.875rem", textDecoration: "underline" }}
//               onClick={() => setShowForgotModal(true)}
//             >
//               Forgot Password?
//             </span>
//           </div>
//         )}

//         <Button
//           type="submit"
//           className="w-100 mt-2 btn btn-dark"
//           disabled={formik.isSubmitting || loading}
//         >
//           {loading ? <Spinner animation="border" size="sm" /> : "Login"}
//         </Button>

//         <div className="text-center mt-3">
//           Don’t have an account?{" "}
//           <span
//             className="text-primary"
//             role="button"
//             style={{ cursor: "pointer" }}
//             onClick={toggleMode}
//           >
//             Register
//           </span>
//         </div>
//       </Form>

//       <ForgotPassword
//         show={showForgotModal}
//         onHide={() => setShowForgotModal(false)}
//       />
//     </>
//   );
// }


import React, { useState } from "react";
import { Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ForgotPassword from "./ForgotPassword";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google"; // ✅ Google OAuth
import { jwtDecode } from "jwt-decode"; // ✅ to decode Google JWT

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

        if (!token || !user) {
          throw new Error("Invalid login response from server.");
        }

        localStorage.setItem("token", token);
        localStorage.setItem("userId", user._id);

        setUser(user);
        toast.success(`Welcome back, ${user.username || "User"}!`);

        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }

        onSuccess?.();
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

  // ✅ Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      // Send the ID token to backend for verification/registration
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google`,
        { token: credentialResponse.credential }
      );

      const { token, user } = res.data;

      if (!token || !user) throw new Error("Invalid Google login response.");

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);

      setUser(user);
      toast.success(`Welcome, ${user.username || decoded.name || "User"}!`);

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

      onSuccess?.();
    } catch (err) {
      console.error("Google login failed:", err);
      toast.error("Google login failed. Please try again.");
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google login was cancelled or failed.");
  };

  return (
    <>
      <Form onSubmit={formik.handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            name="email"
            placeholder="Email or Username"
            {...formik.getFieldProps("email")}
            isInvalid={formik.touched.email && formik.errors.email}
          />
          <Form.Control.Feedback type="invalid">
            {formik.errors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <InputGroup className="mb-1">
          <Form.Control
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            {...formik.getFieldProps("password")}
            isInvalid={formik.touched.password && formik.errors.password}
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </Button>
          <Form.Control.Feedback type="invalid">
            {formik.errors.password}
          </Form.Control.Feedback>
        </InputGroup>

        {attempts >= 3 && (
          <div className="text-end mt-1 mb-2">
            <span
              className="text-primary"
              role="button"
              style={{
                cursor: "pointer",
                fontSize: "0.875rem",
                textDecoration: "underline",
              }}
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </span>
          </div>
        )}

        <Button
          type="submit"
          className="w-100 mt-2 btn btn-dark"
          disabled={formik.isSubmitting || loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "Login"}
        </Button>

        {/* ✅ Divider */}
        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted">or</span>
          <hr className="flex-grow-1" />
        </div>

        {/* ✅ Google Login Button */}
        <div className="d-flex justify-content-center mb-3">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        </div>

        <div className="text-center mt-3">
          Don’t have an account?{" "}
          <span
            className="text-primary"
            role="button"
            style={{ cursor: "pointer" }}
            onClick={toggleMode}
          >
            Register
          </span>
        </div>
      </Form>

      <ForgotPassword
        show={showForgotModal}
        onHide={() => setShowForgotModal(false)}
      />
    </>
  );
}
