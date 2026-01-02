import FanSeries from '../models/FanSeries.js';
import FanVariant from '../models/FanVariant.js';

// -------- Series --------
export const getAllSeries = async (req, res) => {
  try {
    const series = await FanSeries.find()
      .select('model type manufacturer description imageUrl'); // 👈 variants حذف میشه

    console.log('Series from DB:', series.length);
    res.json(series);
  } catch (err) {
    console.error(err);
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
    const variants = await FanVariant.find()
      .populate({
        path: 'fanSeries',
        select: 'model type imageUrl'
      });

    res.json(variants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVariantById = async (req, res) => {
  try {
    const variant = await FanVariant.findById(req.params.id).populate('fanSeries');
    if (!variant) return res.status(404).json({ error: 'Variant not found' });
    res.json(variant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const createVariant = async (req, res) => {
  try {
    const newVariant = await FanVariant.create(req.body);

    // اگر Schema Series داری، ID واریانت جدید رو داخل Series اضافه می‌کنیم
    if (newVariant.fanSeries) {
      await FanSeries.findByIdAndUpdate(newVariant.fanSeries, {
        $push: { variants: newVariant._id }
      });
    }

    res.status(201).json(newVariant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateVariant = async (req, res) => {
  try {
    const updated = await FanVariant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const deleted = await FanVariant.findByIdAndDelete(req.params.id);

    // اگر Series داری، ID واریانت حذف شده رو از Series پاک می‌کنیم
    if (deleted && deleted.fanSeries) {
      await FanSeries.findByIdAndUpdate(deleted.fanSeries, {
        $pull: { variants: deleted._id }
      });
    }

    res.json({ message: 'Variant deleted', deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// -------- Fan Recommendation (Logic) --------
export const recommendFan = async (req, res) => {
  try {
    const { space } = req.body;

    if (!space?.length || !space?.width || !space?.height) {
      return res.status(400).json({ message: 'مشخصات فضا ناقص است' });
    }

    // 1️⃣ محاسبه حجم
    const volume = space.length * space.width * space.height;

    // 2️⃣ تعیین ACH (فعلاً ساده)
    const ACH = space.type === 'industrial' ? 10 : 6;

    // 3️⃣ دبی مورد نیاز
    const requiredAirflow = volume * ACH;

    // 4️⃣ گرفتن واریانت‌ها
    const variants = await FanVariant.find().populate('fanSeries');

    // ساده‌ترین حالت: اولین واریانت رو انتخاب می‌کنیم (بدون PerformancePoint)
    const selectedVariant = variants[0];

    if (!selectedVariant) {
      return res.status(404).json({ message: 'فن مناسبی پیدا نشد' });
    }

    // 5️⃣ خروجی نهایی
    res.json({
      calculation: {
        volume,
        airChangesPerHour: ACH,
        requiredAirflow
      },
      recommendedFan: {
        series: selectedVariant.fanSeries?.model,
        model: selectedVariant.model,
        type: selectedVariant.type,
        airflow: selectedVariant.maxAirflow,
        noise: selectedVariant.noiseLevel
      },
      explanation: `با توجه به حجم ${volume} متر مکعب، این فن انتخاب شده است.`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطا در پیشنهاد فن' });
  }
};
