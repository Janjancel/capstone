// // pages/verify.js
// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import axios from "axios";

// export default function VerifyEmailPage() {
//   const [message, setMessage] = useState("Checking verification...");
//   const router = useRouter();
//   const { email, token, confirm } = router.query;

//   useEffect(() => {
//     if (!email || !token || !confirm) return;

//     if (confirm === "yes") {
//       axios
//         .get(`${process.env.REACT_APP_API_URL}/api/auth/verify?email=${email}&token=${token}`)
//         .then(() => setMessage("✅ Email verified! You can now log in."))
//         .catch(() => setMessage("❌ Verification failed or token expired."));
//     } else {
//       setMessage("⚠️ You rejected the verification. Your account was not activated.");
//     }
//   }, [email, token, confirm]);

//   return (
//     <div style={{ padding: "50px", textAlign: "center" }}>
//       <h3>{message}</h3>
//     </div>
//   );
// }


// src/pages/Verify.jsx
import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const confirm = searchParams.get("confirm"); // 'yes' or 'no'

  useEffect(() => {
    // If confirm param exists, perform verification immediately
    if (token && email && confirm) {
      handleVerify(confirm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (choice) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify`, {
        token,
        email,
        confirm: choice, // 'yes' or 'no'
      });

      Swal.fire("Verification", data.message || "Done", "success").then(() => {
        // If verified, redirect to login page or home
        navigate("/login", { replace: true });
      });
    } catch (err) {
      console.error("Verification failed", err);
      Swal.fire(
        "Verification Error",
        err?.response?.data?.message || "Could not verify email.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 640,
        mx: "auto",
        mt: 8,
        p: 4,
        borderRadius: 2,
        boxShadow: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Email Verification
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography sx={{ mb: 3 }}>
            We were sent a request to verify <strong>{email}</strong>.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button variant="contained" onClick={() => handleVerify("yes")}>
              ✅ Yes, it's me
            </Button>
            <Button variant="outlined" onClick={() => handleVerify("no")}>
              ❌ No, it's not me
            </Button>
          </Box>

          <Typography sx={{ mt: 3, color: "text.secondary" }}>
            If you clicked the email link, the action may have already been processed automatically.
          </Typography>
        </>
      )}
    </Box>
  );
}
