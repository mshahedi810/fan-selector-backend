// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import webhookRoutes from "./routes/webhook.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/webhook", webhookRoutes);

// اینجا endpoint تو
app.post("/api/voice", async (req, res) => {
  const { text } = req.body;

  const response = await axios.post(process.env.COMPANY_CHATGPT_URL, {
    message: `
      متن کاربر: "${text}"
      فقط ۳ مقدار زیر را استخراج کن:
      airflow (m3/h)
      staticPressure (Pa)
      usage (محل استفاده)
      خروجی فقط JSON باشد
    `,
    webhook: process.env.WEBHOOK_URL
  });

  res.json({ status: "sent to AI" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
