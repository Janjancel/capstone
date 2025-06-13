// pages/verify.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Checking verification...");
  const router = useRouter();
  const { email, token, confirm } = router.query;

  useEffect(() => {
    if (!email || !token || !confirm) return;

    if (confirm === "yes") {
      axios
        .get(`http://localhost:5000/api/auth/verify?email=${email}&token=${token}`)
        .then(() => setMessage("✅ Email verified! You can now log in."))
        .catch(() => setMessage("❌ Verification failed or token expired."));
    } else {
      setMessage("⚠️ You rejected the verification. Your account was not activated.");
    }
  }, [email, token, confirm]);

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h3>{message}</h3>
    </div>
  );
}

