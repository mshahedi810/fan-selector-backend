// backend/controllers/analyzeController.js

import axios from "axios";
import Product from "../models/Product.js";

// الگوریتم امتیازدهی
const calculateScore = (product, userRequest) => {
  const userAirflow = Number(userRequest.airflow) || 1;
  const userPressure = Number(userRequest.staticPressure) || 1;

  const airflowDiff = Math.abs(product.maxAirflow - userAirflow) / userAirflow;
  const pressureDiff = Math.abs(product.maxStaticPressure - userPressure) / userPressure;

  const efficiencyAvg =
    product.performanceCurve && product.performanceCurve.length
      ? product.performanceCurve.reduce((acc, cur) => acc + (cur.efficiency || 0), 0) /
        product.performanceCurve.length
      : 0;

  const score =
    (1 - Math.min(airflowDiff, 1)) * 0.5 +
    (1 - Math.min(pressureDiff, 1)) * 0.3 +
    (efficiencyAvg / 100) * 0.2;

  return score;
};

// Endpoint: POST /api/voice
export const analyzeVoice = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });

    // 1️⃣ درخواست به ChatGPT شرکت برای استخراج پارامترها (async via webhook)
    await axios.post(process.env.COMPANY_CHATGPT_URL, {
      message: `
متن کاربر: "${text}"

فقط ۳ مقدار زیر را استخراج کن (خروجی JSON):
{ "airflow": number, "staticPressure": number, "usage": string }
      `,
      webhook: process.env.WEBHOOK_URL,
    });

    // 2️⃣ پاسخ سریع به فرانت: پردازش در حال انجام است
    res.json({ status: "processing_via_webhook" });
  } catch (err) {
    console.error("Error sending to AI:", err.message);
    res.status(500).json({ error: "error_sending_to_ai" });
  }
};

// Webhook: POST /webhook/chatgpt
export const webhookHandler = async (req, res) => {
  try {
    const body = req.body;

    // استخراج مقادیر از webhook
    const userRequest = {
      airflow: Number(body.airflow) || 15000,
      staticPressure: Number(body.staticPressure) || 400,
      usage: body.usage || "عمومی",
    };

    // جستجوی اولیه در MongoDB
    const products = await Product.find({
      maxAirflow: { $gte: Math.max(userRequest.airflow - 5000, 0) },
      maxStaticPressure: { $gte: Math.max(userRequest.staticPressure - 200, 0) },
    }).lean();

    if (!products.length) {
      console.log("no products found for request", userRequest);
      return res.json({ reply: "هیچ محصول مناسبی در دیتابیس پیدا نشد." });
    }

    // امتیازدهی و مرتب‌سازی
    const scored = products.map((p) => ({ product: p, score: calculateScore(p, userRequest) }));
    scored.sort((a, b) => b.score - a.score);

    const topProducts = scored.slice(0, 3).map((s) => s.product);

    // تولید متن انسانی برای فرانت
    let humanReply = `پیشنهادهای پیشنهادی (بر اساس درخواست شما):\n`;
    topProducts.forEach((p, i) => {
      humanReply += `\n${i + 1}. ${p.model} — ${p.manufacturer}\n`;
      humanReply += `${p.description || ""}\n`;
      humanReply += `دبی اسمی: ${p.maxAirflow} m³/h، فشار اسمی: ${p.maxStaticPressure} Pa\n`;
      humanReply += `قیمت: ${p.price ? p.price.toLocaleString() : "نامشخص"}\n`;
    });

    // در صورت نیاز می‌توانیم humanReply را برای زیباسازی به ChatGPT هم بفرستیم
    try {
      const finalAI = await axios.post(process.env.COMPANY_CHATGPT_URL, {
        message: `لطفا متن زیر را به زبان فارسی و حرفه‌ای برای کاربر بازنویسی کن:\n\n${humanReply}`,
      });

      const aiText = finalAI.data?.reply || finalAI.data || humanReply;

      console.log("Final AI text:", aiText);

      return res.json({ reply: aiText, products: topProducts });
    } catch (e) {
      console.warn("AI rewrite failed, returning local summary", e.message);
      return res.json({ reply: humanReply, products: topProducts });
    }
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ error: "webhook_internal_error" });
  }
};
