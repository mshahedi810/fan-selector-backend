// backend/src/importExcel.js
import mongoose from 'mongoose';
import XLSX from 'xlsx';

import FanSeries from './models/FanSeries.js';
import FanVariant from './models/FanVariant.js';
import PerformancePoint from './models/PerformancePoint.js';

// اتصال به MongoDB
await mongoose.connect('mongodb://localhost:27017/fansdb');
console.log('✅ MongoDB Connected');

// تابع کمکی برای تبدیل مقادیر اکسل به Number
const parseNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// ساخت Performance Curve پیش‌فرض
const buildDefaultCurve = (variant) => ([
  {
    airflow: 0,
    staticPressure: 0,
    power: 0,
    efficiency: 0,
    fanVariant: variant._id || null
  },
  {
    airflow: variant.maxAirflow * 0.5,
    staticPressure: 50,
    power: variant.powerConsumption * 0.5,
    efficiency: 65,
    fanVariant: variant._id || null
  },
  {
    airflow: variant.maxAirflow || null,
    staticPressure: 100,
    power: variant.powerConsumption || null,
    efficiency: 70,
    fanVariant: variant._id || null
  }
]);

async function importExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  for (const row of rows) {
    // -------- FanSeries --------
    const seriesType = row.Type ? row.Type.toString().trim() : 'Unknown';
    const seriesModel = row.Model ? row.Model.toString().trim() : 'Unknown';

    let series = await FanSeries.findOne({ type: seriesType });
    if (!series) {
      series = await FanSeries.create({
        model: seriesModel || null,
        type: seriesType || null
      });
    }

    // -------- FanVariant --------
    const variant = await FanVariant.create({
      fanSeries: series._id || null,
      variantName: seriesModel || null,

      impellerDia: parseNumber(row.impellerDia) || null,
      powerConsumption: parseNumber(row.powerConsumption) || null,
      motorRpm: parseNumber(row.motorRpm) || null,
      maxAirflow: parseNumber(row.AirFlow) || null,
      noiseLevel: parseNumber(row.Noise_dB) || null,

      electricalSpecs: {
        voltage: parseNumber(row.Voltage) || null,
        phase: parseNumber(row.Phase) || null,
        frequency: parseNumber(row.Frequency) || null
      },

      mechanicalSpecs: {
        shaftDiameter: parseNumber(row['Shaft_ØJ']),
        bearing: row.Bearing_UCP ? row.Bearing_UCP.toString().trim() : ''
      },

      weights: {
        belt: parseNumber(row.Weight_Belt),
        direct: parseNumber(row.Weight_Direct)
      },

      dimensions: {
        A: parseNumber(row.A_Dim) || null,
        B: parseNumber(row.B_Dim) || null,
        C: parseNumber(row.C_Dim) || null,
        D: parseNumber(row.D_Dim) || null,
        H: parseNumber(row.H_Dim) || null,
        N: parseNumber(row.N_Dim) || null
      }
    });

    // اضافه کردن Variant به Series
    series.variants.push(variant._id);
    await series.save();

    // -------- Performance Curve --------
    await PerformancePoint.insertMany(buildDefaultCurve(variant));

    console.log(`✔ Imported Variant: ${variant.variantName} under Series: ${series.type}`);
  }

  console.log('🎉 Excel import finished!');
  await mongoose.disconnect();
}

// مسیر اکسل خودت
importExcel('F:/fans.xlsx');
