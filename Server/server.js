import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRouter.js";
import messageRouter from "./routes/MessageRouter.js";
import {Server} from "socket.io";

const app = express();
const server = http.createServer(app);

//Intialize socket.io server
export const io = new Server(server, {
  cors: {origin: "*"}
});

//Store online users
export const userSocketMap = {}; //{ userId: socketId }

//socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);
  if(userId) userSocketMap[userId] = socket.id

  //Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", ()=>{
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  })
})

app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/", (req, res) => {
  res.send("Server is live");
});
app.use("/api/auth", userRouter);
app.use("/api/message", messageRouter);

(async ()=>{
    await connectDB();
})();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT} `);
});
