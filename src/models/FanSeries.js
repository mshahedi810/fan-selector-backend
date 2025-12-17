// backend/src/models/FanSeries.js
import mongoose from 'mongoose';

const FanSeriesSchema = new mongoose.Schema({
  model: {
    type: String || null,
    required: true            // مثال: AXC-560M
  },

  type: {
    type: String || null,             // Axial / Backward / Forward
    required: true
  },

  manufacturer: String || null,
  description: String || null,
  imageUrl: String || null,

  minTemp: Number || null,
  maxTemp: Number || null,
  fluidType: [String] || null,

  dimensions: {
    height: Number || null,
    width: Number || null,
    depth: Number || null
  },

  variants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FanVariant'
  }]

}, { timestamps: true });

export default mongoose.model('FanSeries', FanSeriesSchema);
