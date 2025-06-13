import React, { useState } from "react";
import { Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";

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
    // onSubmit: async (values, { setSubmitting, resetForm, setFieldError }) => {
    //   setLoading(true);
    //   try {
    //     const res = await axios.post("http://localhost:5000/api/auth/register", values);
    //     Swal.fire("Success", "You can now log in.", "success");
    //     resetForm();
    //     toggleMode();
    //   } catch (err) {
    //     const msg = err?.response?.data?.message;
    //     if (msg?.includes("email")) setFieldError("email", msg);
    //     if (msg?.includes("username")) setFieldError("username", msg);
    //     Swal.fire("Error", msg || "Something went wrong.", "error");
    //   } finally {
    //     setSubmitting(false);
    //     setLoading(false);
    //   }
    // },

    onSubmit: async (values, { setSubmitting, resetForm, setFieldError }) => {
  setLoading(true);
  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, values);
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
}
  });

  return (
    <Form onSubmit={formik.handleSubmit}>
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

      <InputGroup className="mb-3">
        <Form.Control
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          {...formik.getFieldProps("password")}
          isInvalid={formik.touched.password && formik.errors.password}
        />
        <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </Button>
        <Form.Control.Feedback type="invalid">
          {formik.errors.password}
        </Form.Control.Feedback>
      </InputGroup>

      <InputGroup className="mb-3">
        <Form.Control
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          {...formik.getFieldProps("confirmPassword")}
          isInvalid={formik.touched.confirmPassword && formik.errors.confirmPassword}
        />
        <Button variant="outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </Button>
        <Form.Control.Feedback type="invalid">
          {formik.errors.confirmPassword}
        </Form.Control.Feedback>
      </InputGroup>

      <Button type="submit" className="w-100 mt-2 btn btn-dark" disabled={formik.isSubmitting || loading}>
        {loading ? <Spinner animation="border" size="sm" /> : "Register"}
      </Button>

      <div className="text-center mt-3">
        Already have an account?{" "}
        <span className="text-primary" role="button" style={{ cursor: "pointer" }} onClick={toggleMode}>
          Login
        </span>
      </div>
    </Form>
  );
}
