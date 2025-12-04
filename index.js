import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import webhookRoutes from "./routes/webhook.js";


dotenv.config();
const app = express();


// connect DB
connectDB();


// middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));


// routes
app.use("/api", analyzeRoutes);
app.use("/webhook", webhookRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));