import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fansRoutes from './routes/fans.js';

dotenv.config();
const app = express();
app.use(express.json());

// اتصال به MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'));

// استفاده از routes
app.use('/api/fans', fansRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`MCP running on port ${PORT}`));
