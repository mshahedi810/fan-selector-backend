// backend/src/models/FanSeries.js
import mongoose from 'mongoose';

const FanSeriesSchema = new mongoose.Schema(
  {
    model: { type: String, required: true, trim: true },
    type: { type: String, required: true }, // Backward / Forward
    manufacturer: { type: String, default: null },
    description: { type: String, default: null },
    imageUrl: { type: String, default: null },

    minTemp: { type: Number, default: null },
    maxTemp: { type: Number, default: null },

    fluidType: {
      type: [String],
      default: [],
    },

    // ابعاد مکانیکی سری
    dimensions: {
      A: Number,
      B: Number,
      C: Number,
      D: Number,
      H: Number,
      N: Number,
      shaftDiameter: Number,
    },
  },
  { timestamps: true }
);

// جلوگیری از تکرار مدل
FanSeriesSchema.index({ model: 1 }, { unique: true });

export default mongoose.model('FanSeries', FanSeriesSchema);
