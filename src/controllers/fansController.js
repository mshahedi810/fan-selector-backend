import FanSeries from '../models/FanSeries.js';
import FanVariant from '../models/FanVariant.js';
import PerformancePoint from '../models/PerformancePoint.js';

// -------- Series --------
export const getAllSeries = async (req, res) => {
  try {
    const series = await FanSeries.find().populate('variants');
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createSeries = async (req, res) => {
  try {
    const newSeries = await FanSeries.create(req.body);
    res.status(201).json(newSeries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------- Variant --------
export const getAllVariants = async (req, res) => {
  try {
    const variants = await FanVariant.find().populate('fanSeries');
    res.json(variants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVariantById = async (req, res) => {
  try {
    const variant = await FanVariant.findById(req.params.id).populate('fanSeries');
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createVariant = async (req, res) => {
  try {
    const newVariant = await FanVariant.create(req.body);
    res.status(201).json(newVariant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateVariant = async (req, res) => {
  try {
    const updated = await FanVariant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const deleted = await FanVariant.findByIdAndDelete(req.params.id);
    await PerformancePoint.deleteMany({ fanVariant: req.params.id });
    res.json({ message: 'Variant deleted', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
