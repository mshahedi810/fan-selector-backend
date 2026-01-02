// backend/src/models/FanVariant.js
import mongoose from 'mongoose';

const PerformancePointSchema = new mongoose.Schema(
  {
    airflow: { type: Number, required: true },        // m3/h
    staticPressure: { type: Number, required: true }, // Pa
    power: { type: Number, required: true },          // kW
    efficiency: { type: Number, default: null },      // %
  },
  { _id: false }
);

const FanVariantSchema = new mongoose.Schema(
  {
    fanSeries: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FanSeries',
      required: true,
      index: true,
    },

    variantName: {
      type: String,
      required: true,
      trim: true, // مثال: "1400 RPM"
    },

    // 🔧 عملکرد
    motorRpm: { type: Number, required: true },
    maxAirflow: { type: Number, required: true },
    maxStaticPressure: { type: Number, required: true },
    powerConsumption: { type: Number, required: true }, // kW
    noiseLevel: { type: Number, default: null },

    electricalSpecs: {
      voltage: Number,
      phase: Number,
      frequency: Number,
    },

    mechanicalSpecs: {
      bearing: String,
    },

    weight: { type: Number, default: null }, // kg
    price: { type: Number, default: null },

    performanceCurve: {
      type: [PerformancePointSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// هر Variant فقط یک‌بار در هر Series
FanVariantSchema.index(
  { fanSeries: 1, variantName: 1 },
  { unique: true }
);

export default mongoose.model('FanVariant', FanVariantSchema);
