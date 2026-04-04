import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import experimentRoutes from "./routes/experimentRoutes.js";

dotenv.config();

const app = express();

/* -------- CORS -------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://v-one-kohl.vercel.app"
    ],
  })
);

app.use(express.json());

/* -------- MONGODB -------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));

/* -------- HEALTH CHECK -------- */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* -------- ROUTES -------- */
app.use("/api/experiments", experimentRoutes);

/* -------- SERVER -------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
