import express from 'express';
import {
  getAllSeries,
  getAllVariants,
  getVariantById,
  createSeries,
  createVariant,
  updateVariant,
  deleteVariant,
  recommendFan
} from '../controllers/fansController.js';

const router = express.Router();

/* =======================
   SERIES ROUTES
======================= */

// گرفتن همه سری‌ها (با variants)
router.get('/series', getAllSeries);

// ساخت سری جدید
router.post('/series', createSeries);

/* =======================
   VARIANT ROUTES
======================= */

// گرفتن همه واریانت‌ها
router.get('/variants', getAllVariants);

// گرفتن یک واریانت با id
router.get('/variant/:id', getVariantById);

// ساخت واریانت جدید
router.post('/variant', createVariant);

// ویرایش واریانت
router.put('/variant/:id', updateVariant);

// حذف واریانت
router.delete('/variant/:id', deleteVariant);

// انتخاب فن
router.post('/recommend', recommendFan)

export default router;
