// server.js
import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fansRoutes from "./routes/fans.js";

dotenv.config();

// اتصال به MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

// Mount routes
app.use("/api/fans", fansRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🔥 Backend running on port ${PORT}`)
);
