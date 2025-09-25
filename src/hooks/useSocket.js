// hooks/useSocket.js
import { useEffect } from "react";
import { io } from "socket.io-client";

let socket;

export const useSocket = (user) => {
  useEffect(() => {
    if (!user) return;

    socket = io(process.env.REACT_APP_API_URL, { transports: ["websocket"] });
    socket.emit("join", { userId: user._id, role: user.role || "user" });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socket;
};
