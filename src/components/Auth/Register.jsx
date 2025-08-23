import React, { useState } from "react";
import { Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterForm({ onSuccess, toggleMode }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/register`,
          values
        );
        Swal.fire(
          "Registration Successful",
          "Check your email to verify your account before logging in.",
          "success"
        );
        resetForm();
        toggleMode(); // switch to login form
      } catch (err) {
        const msg = err?.response?.data?.message;
        if (msg?.includes("email")) setFieldError("email", msg);
        if (msg?.includes("username")) setFieldError("username", msg);
        Swal.fire("Error", msg || "Something went wrong.", "error");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      Swal.fire("Error", "No Google credentials received.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google-register`,
        { token: credentialResponse.credential }
      );
      Swal.fire("Success", "Logged in with Google successfully!", "success");
      onSuccess(res.data);
      console.log(res.data);
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Google login failed", "error");
      console.error("Google login failed:", err.response?.data || err.message);
      // console.log("Received token:", token?.slice(0, 20)); 
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    Swal.fire("Error", "Google login failed. Please try again.", "error");
  };

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* Username */}
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          name="username"
          placeholder="Username"
          {...formik.getFieldProps("username")}
          isInvalid={formik.touched.username && formik.errors.username}
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.username}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Email */}
      <Form.Group className="mb-3">
        <Form.Control
          type="email"
          name="email"
          placeholder="Email"
          {...formik.getFieldProps("email")}
          isInvalid={formik.touched.email && formik.errors.email}
        />
        <Form.Control.Feedback type="invalid">
          {formik.errors.email}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Password */}
      <InputGroup className="mb-3">
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

      {/* Confirm Password */}
      <InputGroup className="mb-3">
        <Form.Control
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          {...formik.getFieldProps("confirmPassword")}
          isInvalid={formik.touched.confirmPassword && formik.errors.confirmPassword}
        />
        <Button
          variant="outline-secondary"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          tabIndex={-1}
        >
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </Button>
        <Form.Control.Feedback type="invalid">
          {formik.errors.confirmPassword}
        </Form.Control.Feedback>
      </InputGroup>

      {/* Register Button */}
      <Button
        type="submit"
        className="w-100 mt-2 btn btn-dark"
        disabled={formik.isSubmitting || loading}
      >
        {loading ? <Spinner animation="border" size="sm" /> : "Register"}
      </Button>

      {/* Toggle to Login */}
      <div className="text-center mt-3">
        Already have an account?{" "}
        <span
          className="text-primary"
          role="button"
          style={{ cursor: "pointer" }}
          onClick={toggleMode}
        >
          Login
        </span>
      </div>

      {/* Google Login */}
      <div className="text-center mt-3">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
        />
      </div>
    </Form>
  );
}
