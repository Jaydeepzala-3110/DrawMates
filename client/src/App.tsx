import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function App() {
  const [status, setStatus] = useState("disconnected");
  const [ack, setAck] = useState(null);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setStatus(`connected: ${socket.id}`);

      // emit join-room with an existing roomId
      socket.emit("join-room", { roomId: "ABC123" }, (response : any) => {
        setAck(response);
      });
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("user-joined", (data) => {
      console.log("Another user joined:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2 className="bg-red-400">Join Room Test</h2>
      <p>Status: {status}</p>
      <pre>{ack ? JSON.stringify(ack, null, 2) : "Waiting for ack..."}</pre>
    </div>
  );
}

export default App;
