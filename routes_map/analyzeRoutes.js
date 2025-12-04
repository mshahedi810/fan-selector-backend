import express from "express";
import { analyzeVoice } from "../controllers/analyzeController.js";


const router = express.Router();


router.post('/voice', analyzeVoice);


export default router;
