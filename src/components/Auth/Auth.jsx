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


import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import LoginForm from "./Login";
import RegisterForm from "./Register";
import axios from "axios";

export default function AuthModal({ show, onHide }) {
  const [isLogin, setIsLogin] = useState(true);
  const [userStatuses, setUserStatuses] = useState({});

  const toggleMode = () => setIsLogin(!isLogin);

  const handleClose = () => {
    setIsLogin(true);
    onHide?.();
  };

  useEffect(() => {
    const fetchUserStatuses = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/statuses`
        );
        setUserStatuses(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch user statuses:", err);
      }
    };

    if (show) {
      fetchUserStatuses();
    }
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
