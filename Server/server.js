import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRouter.js";

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/", (req, res) => {
  res.send("Server is live");
});
app.use("/api/auth", userRouter);

(async ()=>{
    await connectDB();
})();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT} `);
});
