import express from 'express';
import { 
  getAllSeries, 
  getAllVariants, 
  getVariantById, 
  createSeries, 
  createVariant, 
  updateVariant, 
  deleteVariant 
} from '../controllers/fansController.js';

const router = express.Router();

// Series
router.get('/series', getAllSeries);
router.post('/series', createSeries);

// Variants
router.get('/variants', getAllVariants);
router.get('/variant/:id', getVariantById);
router.post('/variant', createVariant);
router.put('/variant/:id', updateVariant);
router.delete('/variant/:id', deleteVariant);

export default router;
