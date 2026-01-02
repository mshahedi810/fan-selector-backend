// app.js
import express from "express";
import cors from "cors";

const app = express();

// Middleware ها
app.use(cors({
  origin: "http://localhost:3000", // فرانتت
  credentials: true
}));
app.use(express.json());

// میتونی route های اصلی رو هم اینجا mount کنی یا جدا نگه داری
// مثال:
// import fansRoutes from "./routes/fans.js";
// app.use("/api/fans", fansRoutes);

export default app; // حتما export default داشته باشه
