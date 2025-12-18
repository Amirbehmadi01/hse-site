import express from "express";
import {
  createChecklist,
  getAllChecklists,
  downloadChecklist,
} from "../controllers/checklistControllers.js"; // ⚠️ اسم فایل کنترلر دقت شود (بدون s)
import upload from "../middlewars/uploadMiddleware.js"; // ⚠️ پوشه‌ی middlewares درست باشد (نه middlewars)

const router = express.Router();

// ✅ ایجاد چک‌لیست جدید (با آپلود عکس)
router.post("/", upload.single("image"), createChecklist);

// ✅ گرفتن تمام چک‌لیست‌ها
router.get("/", getAllChecklists);

// ✅ دانلود اکسل چک‌لیست خاص
router.get("/download/:id", downloadChecklist);

export default router;