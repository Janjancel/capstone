// import React, { useState } from "react";
// import { Modal, Button, Form, InputGroup } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import Swal from "sweetalert2";
// import { auth } from "../../firebase/firebase"; // Make sure this is correct
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   updateProfile,
// } from "firebase/auth";

// export default function AuthModal({ show, onHide }) {
//   const navigate = useNavigate();
//   const [isLogin, setIsLogin] = useState(true);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const toggleMode = () => {
//     setIsLogin(!isLogin);
//     formik.resetForm();
//   };

//   const formik = useFormik({
//     enableReinitialize: true,
//     initialValues: {
//       username: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     },
//     validationSchema: Yup.object({
//       username: !isLogin
//         ? Yup.string().min(3, "Username must be at least 3 characters").required("Username is required")
//         : Yup.string(),
//       email: Yup.string().email("Invalid email").required("Email is required"),
//       password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
//       confirmPassword: !isLogin
//         ? Yup.string()
//             .oneOf([Yup.ref("password")], "Passwords must match")
//             .required("Confirm Password is required")
//         : Yup.string(),
//     }),
//     onSubmit: async (values, { setSubmitting, resetForm }) => {
//       try {
//         if (isLogin) {
//           const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
//           Swal.fire("Login Successful", "Welcome back!", "success");
//           localStorage.setItem("uid", userCredential.user.uid);
//           navigate("/");
//           window.location.reload();
//         } else {
//           const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
//           await updateProfile(userCredential.user, {
//             displayName: values.username,
//           });
//           Swal.fire("Registered Successfully", "You can now log in.", "success");
//           setIsLogin(true);
//           resetForm();
//         }
//         onHide();
//       } catch (error) {
//         // Friendly error messages based on Firebase error codes
//         let errorMsg = error.message;
//         if (error.code === "auth/email-already-in-use") {
//           errorMsg = "This email is already registered.";
//         } else if (error.code === "auth/invalid-email") {
//           errorMsg = "Please enter a valid email address.";
//         } else if (error.code === "auth/wrong-password") {
//           errorMsg = "Incorrect password.";
//         }
//         Swal.fire("Error", errorMsg, "error");
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   const handleClose = () => {
//     formik.resetForm();
//     setIsLogin(true);
//     onHide();
//   };

//   return (
//     <Modal show={show} onHide={handleClose} centered>
//       <Modal.Header closeButton>
//         <Modal.Title>{isLogin ? "Login to Your Account" : "Create an Account"}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form onSubmit={formik.handleSubmit}>
//           {!isLogin && (
//             <Form.Group className="mb-3">
//               <Form.Control
//                 type="text"
//                 name="username"
//                 placeholder="Username"
//                 {...formik.getFieldProps("username")}
//                 isInvalid={formik.touched.username && formik.errors.username}
//               />
//               <Form.Control.Feedback type="invalid">{formik.errors.username}</Form.Control.Feedback>
//             </Form.Group>
//           )}

//           <Form.Group className="mb-3">
//             <Form.Control
//               type="email"
//               name="email"
//               placeholder="Email"
//               {...formik.getFieldProps("email")}
//               isInvalid={formik.touched.email && formik.errors.email}
//             />
//             <Form.Control.Feedback type="invalid">{formik.errors.email}</Form.Control.Feedback>
//           </Form.Group>

//           <InputGroup className="mb-3">
//             <Form.Control
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="Password"
//               {...formik.getFieldProps("password")}
//               isInvalid={formik.touched.password && formik.errors.password}
//             />
//             <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
//               {showPassword ? <FaEyeSlash /> : <FaEye />}
//             </Button>
//             <Form.Control.Feedback type="invalid">{formik.errors.password}</Form.Control.Feedback>
//           </InputGroup>

//           {!isLogin && (
//             <InputGroup className="mb-3">
//               <Form.Control
//                 type={showConfirmPassword ? "text" : "password"}
//                 name="confirmPassword"
//                 placeholder="Confirm Password"
//                 {...formik.getFieldProps("confirmPassword")}
//                 isInvalid={formik.touched.confirmPassword && formik.errors.confirmPassword}
//               />
//               <Button variant="outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
//                 {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//               </Button>
//               <Form.Control.Feedback type="invalid">{formik.errors.confirmPassword}</Form.Control.Feedback>
//             </InputGroup>
//           )}

//           <Button type="submit" className="w-100 mt-2 btn btn-dark" disabled={formik.isSubmitting}>
//             {isLogin ? "Login" : "Register"}
//           </Button>
//         </Form>

//         <div className="text-center mt-3">
//           {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
//           <span role="button" className="text-primary" onClick={toggleMode} style={{ cursor: "pointer" }}>
//             {isLogin ? "Register" : "Login"}
//           </span>
//         </div>
//       </Modal.Body>
//     </Modal>
//   );
// }


import React, { useState } from "react";
import { Modal, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { differenceInMinutes } from "date-fns";
import { auth, db } from "../../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function AuthModal({ show, onHide }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    formik.resetForm();
  };

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,}$/;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      username: !isLogin
        ? Yup.string().min(3, "Username must be at least 3 characters").required("Username is required")
        : Yup.string(),
      email: Yup.string().required("Email or Username is required"),
      password: Yup.string().matches(passwordRegex).required("Password is required"),
      confirmPassword: !isLogin
        ? Yup.string().oneOf([Yup.ref("password")]).required("Confirm Password is required")
        : Yup.string(),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setLoading(true);
      try {
        if (isLogin) {
          let loginEmail = values.email;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          let userDocId = null;
          let userStatus = null;

          if (!emailRegex.test(values.email)) {
            const querySnapshot = await getDocs(collection(db, "users"));
            let foundUser = null;

            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data.username?.toLowerCase() === values.email.toLowerCase()) {
                foundUser = { ...data, id: docSnap.id };
              }
            });

            if (!foundUser) {
              throw new Error("No user found with that username.");
            }

            loginEmail = foundUser.email;
            userDocId = foundUser.id;

            const lastLogin = foundUser.lastLogin?.toDate?.() || foundUser.lastLogin;
            const minutes = differenceInMinutes(new Date(), lastLogin);

            if (foundUser.status === "online" && minutes <= 30) {
              throw new Error("This account is already logged in.");
            } else if (minutes > 30) {
              await updateDoc(doc(db, "users", userDocId), { status: "offline" });
            }
          }

          const userQuery = query(collection(db, "users"), where("email", "==", loginEmail));
          const userSnapshot = await getDocs(userQuery);
          const userSnap = userSnapshot.docs[0];
          const user = userSnap?.data();

          if (!userSnap || !user) throw new Error("User not found.");
          userDocId = userSnap.id;

          const lastLogin = user.lastLogin?.toDate?.() || user.lastLogin;
          const minutes = differenceInMinutes(new Date(), lastLogin);

          if (user.status === "online" && minutes <= 30) {
            throw new Error("This account is already logged in.");
          } else if (minutes > 30) {
            await updateDoc(doc(db, "users", userDocId), { status: "offline" });
          }

          // Optional realtime status validation
          const unsubscribe = onSnapshot(doc(db, "users", userDocId), (docSnap) => {
            const liveData = docSnap.data();
            if (liveData?.status === "online") {
              const last = liveData.lastLogin?.toDate?.() || liveData.lastLogin;
              const mins = differenceInMinutes(new Date(), last);
              if (mins <= 30) {
                Swal.fire("Warning", "This account is currently active.", "info");
                unsubscribe();
              }
            }
          });

          const credential = await signInWithEmailAndPassword(auth, loginEmail, values.password);
          const uid = credential.user.uid;

          await updateDoc(doc(db, "users", uid), {
            status: "online",
            lastLogin: new Date(),
          });

          const finalDoc = await getDoc(doc(db, "users", uid));
          const finalData = finalDoc.data();

          Swal.fire("Login Successful", `Welcome back, ${finalData.role || "user"}!`, "success");
          localStorage.setItem("uid", uid);
          navigate(finalData.role === "admin" ? "/admin" : "/");
          window.location.reload();
        } else {
          const emailTaken = await getDocs(query(collection(db, "users"), where("email", "==", values.email)));
          if (!emailTaken.empty) throw new Error("This email is already registered.");

          const usernameTaken = await getDocs(query(collection(db, "users"), where("username", "==", values.username)));
          if (!usernameTaken.empty) throw new Error("This username is already taken.");

          const credential = await createUserWithEmailAndPassword(auth, values.email, values.password);
          const uid = credential.user.uid;

          await updateProfile(credential.user, { displayName: values.username });

          await setDoc(doc(db, "users", uid), {
            uid,
            username: values.username,
            email: values.email,
            role: "client",
            status: "online",
            createdAt: new Date(),
            lastLogin: new Date(),
          });

          Swal.fire("Registered Successfully", "You can now log in.", "success");
          setIsLogin(true);
          resetForm();
        }

        onHide();
      } catch (error) {
        let errorMsg = error.message;
        if (error.code === "auth/email-already-in-use") {
          errorMsg = "This email is already registered.";
        } else if (error.code === "auth/invalid-email") {
          errorMsg = "Please enter a valid email address.";
        } else if (error.code === "auth/wrong-password") {
          errorMsg = "Incorrect password.";
        }
        Swal.fire("Error", errorMsg, "error");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setIsLogin(true);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isLogin ? "Login to Your Account" : "Create an Account"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={formik.handleSubmit}>
          {!isLogin && (
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
          )}

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

          {!isLogin && (
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
          )}

          <Button type="submit" className="w-100 mt-2 btn btn-dark" disabled={formik.isSubmitting || loading}>
            {loading ? <Spinner animation="border" size="sm" /> : isLogin ? "Login" : "Register"}
          </Button>
        </Form>

        <div className="text-center mt-3">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span role="button" className="text-primary" onClick={toggleMode} style={{ cursor: "pointer" }}>
            {isLogin ? "Register" : "Login"}
          </span>
        </div>
      </Modal.Body>
    </Modal>
  );
}
