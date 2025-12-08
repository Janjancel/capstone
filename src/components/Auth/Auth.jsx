// import React, { useState, useEffect } from "react";
// import { Modal } from "react-bootstrap";
// import LoginForm from "./Login";
// import RegisterForm from "./Register";
// import axios from "axios";

// export default function AuthModal({ show, onHide }) {
//   const [isLogin, setIsLogin] = useState(true);
//   const [userStatuses, setUserStatuses] = useState({});

//   const toggleMode = () => setIsLogin(!isLogin);

//   const handleClose = () => {
//     setIsLogin(true);
//     onHide();
//   };

//   useEffect(() => {
//     const fetchUserStatuses = async () => {
//       try {
//       const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/statuses`);

//         setUserStatuses(res.data);
//       } catch (err) {
//         console.error("❌ Failed to fetch user statuses:", err);
//       }
//     };

//     if (show) {
//       fetchUserStatuses();
//     }
//   }, [show]);

//   return (
//     <Modal show={show} onHide={handleClose} centered>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {isLogin ? "Login to Your Account" : "Create an Account"}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {isLogin ? (
//           <LoginForm
//             onSuccess={handleClose}
//             toggleMode={toggleMode}
//             liveStatuses={userStatuses}
//           />
//         ) : (
//           <RegisterForm
//             onSuccess={handleClose}
//             toggleMode={toggleMode}
//           />
//         )}
//       </Modal.Body>
//     </Modal>
//   );
// }


// import React, { useState, useEffect } from "react";
// import { Modal } from "react-bootstrap";
// import LoginForm from "./Login";
// import RegisterForm from "./Register";
// import axios from "axios";

// export default function AuthModal({ show, onHide }) {
//   const [isLogin, setIsLogin] = useState(true);
//   const [userStatuses, setUserStatuses] = useState({});

//   const toggleMode = () => setIsLogin(!isLogin);

//   const handleClose = () => {
//     setIsLogin(true);
//     onHide?.();
//   };

//   useEffect(() => {
//     const fetchUserStatuses = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/users/statuses`
//         );
//         setUserStatuses(res.data);
//       } catch (err) {
//         console.error("❌ Failed to fetch user statuses:", err);
//       }
//     };

//     if (show) {
//       fetchUserStatuses();
//     }
//   }, [show]);

//   return (
//     <Modal show={show} onHide={handleClose} centered>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {isLogin ? "Login to Your Account" : "Create an Account"}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {isLogin ? (
//           <LoginForm
//             onSuccess={handleClose}
//             toggleMode={toggleMode}
//             liveStatuses={userStatuses}
//           />
//         ) : (
//           <RegisterForm onSuccess={handleClose} toggleMode={toggleMode} />
//         )}
//       </Modal.Body>
//     </Modal>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { Modal } from "react-bootstrap";
// import LoginForm from "./Login";
// import RegisterForm from "./Register";
// import axios from "axios";

// /**
//  * AuthModal
//  *
//  * Props:
//  *  - show: boolean -> whether modal is visible
//  *  - onHide: function -> callback to parent to hide the modal
//  *
//  * Important: LoginForm and RegisterForm should call onSuccess (passed here as handleClose)
//  * after a successful login/register so the modal closes automatically.
//  */
// export default function AuthModal({ show, onHide }) {
//   const [isLogin, setIsLogin] = useState(true);
//   const [userStatuses, setUserStatuses] = useState({});

//   const toggleMode = () => setIsLogin((prev) => !prev);

//   const handleClose = () => {
//     setIsLogin(true); // reset to login when closed
//     onHide?.();
//   };

//   // Fetch user statuses when modal is shown
//   useEffect(() => {
//     let cancelled = false;

//     const fetchUserStatuses = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/users/statuses`
//         );
//         if (!cancelled) {
//           setUserStatuses(res.data);
//         }
//       } catch (err) {
//         console.error("❌ Failed to fetch user statuses:", err);
//       }
//     };

//     if (show) {
//       fetchUserStatuses();
//     }

//     return () => {
//       cancelled = true;
//     };
//   }, [show]);

//   // If the modal opens and there's already a token (login just happened or user is already logged in),
//   // close the modal automatically. This acts as a safety net in case LoginForm writes token directly.
//   useEffect(() => {
//     if (!show) return;

//     const token = localStorage.getItem("token");
//     if (token) {
//       // small tick to ensure parent state updates (optional)
//       // but calling handleClose directly is fine:
//       handleClose();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [show]);

//   return (
//     <Modal show={show} onHide={handleClose} centered>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {isLogin ? "Login to Your Account" : "Create an Account"}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {isLogin ? (
//           <LoginForm
//             onSuccess={handleClose}
//             toggleMode={toggleMode}
//             liveStatuses={userStatuses}
//           />
//         ) : (
//           <RegisterForm onSuccess={handleClose} toggleMode={toggleMode} />
//         )}
//       </Modal.Body>
//     </Modal>
//   );
// }


import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import LoginForm from "./Login";
import RegisterForm from "./Register";
import axios from "axios";

/**
 * AuthModal
 *
 * Props:
 *  - show: boolean -> whether modal is visible
 *  - onHide: function -> callback to parent to hide the modal
 *
 * Important: LoginForm and RegisterForm should call onSuccess (passed here as handleClose)
 * after a successful login/register so the modal closes automatically.
 */
export default function AuthModal({ show, onHide }) {
  const [isLogin, setIsLogin] = useState(true);
  const [userStatuses, setUserStatuses] = useState({});

  const toggleMode = () => setIsLogin((prev) => !prev);

  const handleClose = () => {
    setIsLogin(true); // reset to login when closed
    if (typeof onHide === "function") onHide();
  };

  // Fetch user statuses when modal is shown
  useEffect(() => {
    let cancelled = false;

    const fetchUserStatuses = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/statuses`
        );
        if (!cancelled) {
          setUserStatuses(res.data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch user statuses:", err);
      }
    };

    if (show) {
      fetchUserStatuses();
    }

    return () => {
      cancelled = true;
    };
  }, [show]);

  // If the modal opens and there's already a token (login just happened or user is already logged in),
  // close the modal automatically. This acts as a safety net in case LoginForm writes token directly.
  useEffect(() => {
    if (!show) return;

    const token = localStorage.getItem("token");
    if (token) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isLogin ? "Login to Your Account" : "Create an Account"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLogin ? (
          <LoginForm
            onSuccess={handleClose}
            toggleMode={toggleMode}
            liveStatuses={userStatuses}
          />
        ) : (
          <RegisterForm onSuccess={handleClose} toggleMode={toggleMode} />
        )}
      </Modal.Body>
    </Modal>
  );
}
