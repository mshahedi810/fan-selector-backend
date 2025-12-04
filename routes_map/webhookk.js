import express from "express";
import axios from "axios";
import Product from "../models/Product.js";

const router = express.Router();


// تابع امتیازدهی
function calculateScore(product, user) {
  let airflowWeight = 0.6;
  let pressureWeight = 0.4;

  const airflowScore = (product.maxAirflow - user.airflow) / user.airflow;
  const pressureScore = (product.maxStaticPressure - user.staticPressure) / user.staticPressure;

  return airflowScore * airflowWeight + pressureScore * pressureWeight;
}



// 📌 وب‌هوک اصلی
router.post("/chatgpt", async (req, res) => {
  try {
    const body = req.body;
    console.log("🔵 Webhook Body:", body);

    const userRequest = {
      airflow: Number(body.airflow) || 15000,
      staticPressure: Number(body.staticPressure) || 400,
      usage: body.usage || "عمومی"
    };


    // ---- مرحله ۱: جستجوی اولیه در دیتابیس ----
    const products = await Product.find({
      maxAirflow: { $gte: Math.max(userRequest.airflow - 5000, 0) },
      maxStaticPressure: { $gte: Math.max(userRequest.staticPressure - 200, 0) }
    }).lean();


    if (!products.length) {
      console.log("❌ No products found for request:", userRequest);
      return res.json({ reply: "هیچ محصول مناسبی در دیتابیس پیدا نشد." });
    }


    // ---- مرحله ۲: امتیازدهی ----
    const scored = products.map(p => ({
      product: p,
      score: calculateScore(p, userRequest)
    }));

    scored.sort((a, b) => b.score - a.score);

    const topProducts = scored.slice(0, 3).map(s => s.product);


    // ---- مرحله ۳: ساخت خلاصه اولیه انسانی ----
    let humanReply = `پیشنهادهای مناسب بر اساس درخواست شما:\n`;

    topProducts.forEach((p, i) => {
      humanReply += `\n${i + 1}. ${p.model} — ${p.manufacturer}\n`;
      humanReply += `${p.description || ""}\n`;
      humanReply += `دبی: ${p.maxAirflow} m³/h، فشار: ${p.maxStaticPressure} Pa\n`;
      humanReply += `قیمت: ${p.price ? p.price.toLocaleString() : "نامشخص"}\n`;
    });



    // ---- مرحله ۴: ارسال متن به AI برای بازنویسی (اگر لازم بود) ----
    try {
      const aiRes = await axios.post(process.env.COMPANY_CHATGPT_URL, {
        message: `این متن را به صورت حرفه‌ای و روان بازنویسی کن:\n\n${humanReply}`
      });

      const finalText =
        aiRes.data?.reply || aiRes.data || humanReply;

      console.log("🟢 Final AI Reply:", finalText);

      return res.json({ reply: finalText, products: topProducts });

    } catch (rewriteError) {
      console.warn("⚠️ AI rewrite failed → sending original text");
      return res.json({ reply: humanReply, products: topProducts });
    }


  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return res.status(500).json({ error: "webhook_internal_error" });
  }
});



export default router;
