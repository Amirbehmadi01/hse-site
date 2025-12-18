// import express from "express";
// import dotenv from "dotenv";
// import { fileURLToPath } from "url";
// import cors from "cors";
// import morgan from "morgan";
// import path from "path";
// import connectDB from "./config/db.js";
// import checklistRoutes from "./routes/checklistRoutes.js";
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import nonConformityRoutes from "./routes/nonConformityRoutes.js";
// import healthRoutes from "./routes/healthRoutes.js";

// // Load .env placed in the backend folder reliably even when process.cwd() is different
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.join(__dirname, ".env") });

// // اتصال به MongoDB Atlas
// connectDB();

// const app = express();

// // Middlewareها
// app.use(cors());
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // ✅ اضافه شده
// app.use("/uploads", express.static("uploads")); // ✅ نمایش فایل‌های آپلودشده

// // مسیرهای API
// // Register API routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/nonconformities", nonConformityRoutes);
// app.use("/api/health", healthRoutes);
// app.use("/api/checklists", checklistRoutes);

// // تنظیم پورت و اجرای سرور
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import connectDB from "./config/db.js";
import checklistRoutes from "./routes/checklistRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import nonConformityRoutes from "./routes/nonConformityRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// اتصال MongoDB
connectDB();

const app = express();

// 🔥 CORS برای فرانت روی پورت‌های 5173 و 5174
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(
  cors({
    origin: (origin, callback) => {
      // اجازه درخواست‌های بدون Origin (مثلاً Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS blocked"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/nonconformities", nonConformityRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/checklists", checklistRoutes);

// Run server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));