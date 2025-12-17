import mongoose from 'mongoose';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import FanSeries from './models/FanSeries.js';
import FanVariant from './models/FanVariant.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // پاک کردن داده‌های قبلی
    await FanSeries.deleteMany({});
    await FanVariant.deleteMany({});

    // خواندن فایل اکسل
    const workbook = XLSX.readFile('./ftp_fan_data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // ایجاد Series و Variant
    for (const row of data) {
      // ابتدا بررسی کنیم Series قبلا وجود داره یا نه
      let series = await FanSeries.findOne({ model: row.Model });
      if (!series) {
        series = new FanSeries({
          model: row.Model,
          type: row.Type,
          manufacturer: row.Manufacturer || 'N/A',
          description: row.Description || '',
          imageUrl: row.ImageUrl || '',
          minTemp: row.MinTemp || -20,
          maxTemp: row.MaxTemp || 60,
          fluidType: row.FluidType ? row.FluidType.split(',') : ['هوای تمیز'],
          electricalSpecs: {
            voltage: row.Voltage || 380,
            phase: row.Phase || 3,
            frequency: row.Frequency || 50
          },
          dimensions: {
            height: row.H_Dim || 0,
            width: row.B_Dim || 0,
            depth: row.C_Dim || 0
          },
          variants: []
        });
        await series.save();
      }

      // ایجاد Variant
      const variant = new FanVariant({
        fanSeries: series._id,
        maxAirflow: row.AirFlow || 0,
        maxStaticPressure: row.StaticPressure || 0,
        powerConsumption: row.Power || 0,
        motorRpm: row.Speed || 0,
        noiseLevel: row.Sound || 0,
        price: row.Price || 0,
        performanceCurve: row.PerformanceCurve || []
      });

      await variant.save();

      // اتصال Variant به Series
      series.variants.push(variant._id);
      await series.save();
    }

    console.log('Seed completed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
