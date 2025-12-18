import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Health check endpoint
router.get("/", (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStatusText = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }[mongoStatus] || "unknown";

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: {
      status: mongoStatusText,
      readyState: mongoStatus,
      connected: mongoStatus === 1,
    },
  });
});

export default router;

