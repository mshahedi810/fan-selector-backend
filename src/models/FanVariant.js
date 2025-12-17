// backend/src/models/FanVariant.js
import mongoose from 'mongoose';

const FanVariantSchema = new mongoose.Schema({
  fanSeries: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FanSeries',
    required: true
  },

  variantName: {
    type: String || null,
    required: true
  },

  impellerDia: Number || null,        // mm
  powerConsumption: Number || null,   // kW
  motorRpm: Number || null,
  maxAirflow: Number || null,         // m3/h
  noiseLevel: Number || null,         // dB

  electricalSpecs: {
    voltage: Number || null,
    phase: Number || null,
    frequency: Number || null
  },

  mechanicalSpecs: {
    shaftDiameter: Number || null,
    bearing: String || null
  },

  weights: {
    belt: Number || null,
    direct: Number || null
  },

  dimensions: {
    A: Number || null,
    B: Number || null,
    C: Number || null,
    D: Number || null,
    H: Number || null,
    N: Number || null
  },

  price: Number || null

}, { timestamps: true });

export default mongoose.model('FanVariant', FanVariantSchema);
