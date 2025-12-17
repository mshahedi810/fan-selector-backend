import mongoose from 'mongoose';

const PerformancePointSchema = new mongoose.Schema({
  airflow: Number,
  staticPressure: Number,
  power: Number,
  efficiency: Number,
  fanVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'FanVariant' }
});

export default mongoose.model('PerformancePoint', PerformancePointSchema);
