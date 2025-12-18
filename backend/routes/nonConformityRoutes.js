// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import {
//   createNonConformity,
//   getNonConformities,
//   getNonConformitiesWithResponses,
//   updateNonConformity,
//   approveResponse,
//   rejectResponse,
//   markSeenByAdmin,
//   deleteNonConformity,
//   getUserNotifications,
// } from "../controllers/nonConformityController.js";

// // Dedicated storage to ensure path /uploads/nonconformities
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = path.join("uploads", "nonconformities");
//     try {
//       fs.mkdirSync(dir, { recursive: true });
//     } catch {}
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage });

// const router = express.Router();

// router.post(
//   "/",
//   upload.fields([
//     { name: "beforeImages", maxCount: 10 },
//     { name: "afterImages", maxCount: 10 },
//   ]),
//   createNonConformity
// );

// router.get("/", getNonConformities);
// router.get("/responses", getNonConformitiesWithResponses);
// router.get("/notifications", getUserNotifications);

// router.put(
//   "/:id",
//   upload.fields([
//     { name: "beforeImages", maxCount: 10 },
//     { name: "afterImages", maxCount: 10 },
//   ]),
//   updateNonConformity
// );

// router.post("/:id/approve", approveResponse);
// router.post("/:id/reject", rejectResponse);
// router.post("/mark-seen", markSeenByAdmin);

// router.delete("/:id", deleteNonConformity);

// export default router;

//12/9
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  createNonConformity,
  getNonConformities,
  getNonConformitiesWithResponses,
  updateNonConformity,
  approveResponse,
  rejectResponse,
  markSeenByAdmin,
  deleteNonConformity,
  getUserNotifications,
} from "../controllers/nonConformityController.js";

import { exportNonConformitiesExcel } from "../controllers/exportExcel.js"; // ⬅ جدید

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("uploads", "nonconformities");
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
    cb(null, dir);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

const router = express.Router();

// ایجاد عدم انطباق جدید
router.post(
  "/",
  upload.fields([
    { name: "beforeImages", maxCount: 10 },
    { name: "afterImages", maxCount: 10 },
  ]),
  createNonConformity
);

// گرفتن لیست عدم انطباق‌ها
router.get("/", getNonConformities);

// گرفتن موارد دارای پاسخ
router.get("/responses", getNonConformitiesWithResponses);

// نوتیفیکیشن‌ها
router.get("/notifications", getUserNotifications);

// آپدیت
router.put(
  "/:id",
  upload.fields([
    { name: "beforeImages", maxCount: 10 },
    { name: "afterImages", maxCount: 10 },
  ]),
  updateNonConformity
);

// تایید / رد
router.post("/:id/approve", approveResponse);
router.post("/:id/reject", rejectResponse);

// خوانده‌شدن توسط ادمین
router.post("/mark-seen", markSeenByAdmin);

// حذف عدم انطباق
router.delete("/:id", deleteNonConformity);

// دانلود اکسل  ⬅⬅⬅ جدید
router.get("/export/:unit/:subUnit/:month", exportNonConformitiesExcel);

export default router;
