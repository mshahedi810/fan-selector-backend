import mongoose from 'mongoose';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import FanSeries from './models/FanSeries.js';
import FanVariant from './models/FanVariant.js';

dotenv.config();

/* ---------- Utils ---------- */
const safeNumber = (val, defaultValue = null) => {
  if (val === '-' || val === '' || val === null || val === undefined) return defaultValue;
  const n = Number(val);
  return isNaN(n) ? defaultValue : n;
};

const safeString = (val, defaultValue = null) => {
  if (typeof val !== 'string') return defaultValue;
  const t = val.trim();
  return t.length ? t : defaultValue;
};

/* ---------- Seed ---------- */
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // پاک‌سازی کامل Collections
    await FanSeries.deleteMany({});
    await FanVariant.deleteMany({});
    console.log('🧹 Collections cleared');

    const workbook = XLSX.readFile('./ftp_fan_data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      /* ---------- FanSeries ---------- */
      const modelName = safeString(row.model || row.Model, 'Unnamed Model');

      let series = await FanSeries.findOne({ model: modelName });

      if (!series) {
        series = new FanSeries({
          model: modelName,
          type: safeString(row.type || row.Type, 'Unknown'),
          manufacturer: safeString(row.manufacturer || row.Manufacturer),
          description: safeString(row.description || row.Description),
          imageUrl: safeString(row.imageUrl || row.ImageUrl),

          minTemp: safeNumber(row.minTemp || row.MinTemp),
          maxTemp: safeNumber(row.maxTemp || row.MaxTemp),

          fluidType: safeString(row.fluidType || row.FluidType)
            ? safeString(row.fluidType || row.FluidType)
              .split(',')
              .map(s => s.trim())
            : null,

          dimensions: {
            height: safeNumber(row.H_Dim),
            width: safeNumber(row.B_Dim),
            depth: safeNumber(row.C_Dim),
          },

          variants: [],
        });

        await series.save();
      }

      /* ---------- FanVariant ---------- */
      const variantName =
        safeString(row.variantName || row.VariantName) ||
        `${modelName}-${safeNumber(row.AirFlow, 0)}`;

      let variant = await FanVariant.findOne({
        fanSeries: series._id,
        variantName,
      });

      if (!variant) {
        // Parse PerformanceCurve safely
        let performanceCurve = [];
        const curveStr = safeString(row.PerformanceCurve, '');
        if (curveStr) {
          try {
            const parsed = typeof curveStr === 'string' ? JSON.parse(curveStr) : curveStr;
            if (Array.isArray(parsed)) {
              performanceCurve = parsed.map(p => ({
                airflow: safeNumber(p.airflow),
                staticPressure: safeNumber(p.staticPressure),
                power: safeNumber(p.power),
                efficiency: safeNumber(p.efficiency),
              }));
            }
          } catch {
            performanceCurve = [];
          }
        }

        variant = new FanVariant({
          fanSeries: series._id,
          variantName,
          maxAirflow: safeNumber(row.AirFlow, 0),
          maxStaticPressure: safeNumber(row.StaticPressure, 0),
          powerConsumption: safeNumber(row.Power, 0),
          motorRpm: safeNumber(row.Speed, 0),
          noiseLevel: safeNumber(row.Sound),
          price: safeNumber(row.Price),
          performanceCurve,
        });

        await variant.save();

        // ⭐ جلوگیری از اضافه شدن تکراری Variant به Series
        if (!series.variants) series.variants = [];

        if (!series.variants.includes(variant._id)) {
          series.variants.push(variant._id);
          await series.save();
        }
      }
    }

    console.log('🎉 Seed completed successfully');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
