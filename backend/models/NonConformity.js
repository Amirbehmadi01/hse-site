// import mongoose from "mongoose";

// const nonConformitySchema = new mongoose.Schema(
//   {
//     department: { 
//       type: String, 
//       required: true,
//       enum: ["Production 1", "Plastic Injection", "Maintenance", "Warehouse"]
//     },
//     s: { 
//       type: String, 
//       enum: ["S1", "S2", "S3", "S4", "S5", "Safety"],
//       required: true
//     },
//     description: { type: String, required: true },
//     beforeImages: [{ type: String }],
//     afterImages: [{ type: String }],
//     status: { 
//       type: String, 
//       enum: ["Fixed", "Not Fixed", "Incomplete", "Awaiting Review"], 
//       default: "Incomplete" 
//     },
//     progress: { type: Number, default: 0, min: 0, max: 100 },
//     notes: { type: String, default: "" },
//     date: { type: Date, default: Date.now },
//     seenByAdmin: { type: Boolean, default: false },
//     seenByUser: { type: Boolean, default: false },
//     reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     reviewedDate: { type: Date },
//     hasNewResponse: { type: Boolean, default: false }, // Flag for new user responses
//   },
//   { timestamps: true }
// );

// export default mongoose.model("NonConformity", nonConformitySchema);

//12/9
// import mongoose from "mongoose";

// const nonConformitySchema = new mongoose.Schema(
//   {
//     department: { 
//       type: String, 
//       required: true,
//       enum: ["Production 1", "Plastic Injection", "Maintenance", "Warehouse"]
//     },
//     s: { 
//       type: String, 
//       enum: ["S1", "S2", "S3", "S4", "S5", "Safety"],
//       required: true
//     },
//     description: { type: String, required: true },
//     beforeImages: [{ type: String }],
//     afterImages: [{ type: String }],
//     status: { 
//       type: String, 
//       enum: ["Fixed", "Not Fixed", "Incomplete", "Awaiting Review"], 
//       default: "Incomplete" 
//     },
//     progress: { type: Number, default: 0, min: 0, max: 100 },
//     notes: { type: String, default: "" },
//     date: { type: Date, default: Date.now },
//     seenByAdmin: { type: Boolean, default: false },
//     seenByUser: { type: Boolean, default: false },
//     reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     reviewedDate: { type: Date },
//     hasNewResponse: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// // 🔥 جلوگیری از OverwriteModelError
// export default mongoose.models.NonConformity ||
//   mongoose.model("NonConformity", nonConformitySchema);


//14/9

import mongoose from "mongoose";

const nonConformitySchema = new mongoose.Schema(
  {
    // واحد اصلی (نام فارسی بخش) - نگه می‌داریم تا با فیلدهای قبلی ناسازگار نشود
    unit: {
      type: String,
      required: true,
      trim: true,
    },

    // برای سازگاری با کد قدیمی که از department استفاده می‌کرد
    department: {
      type: String,
      required: true,
      trim: true,
    },

    // زیرواحد
    subunit: {
      type: String,
      required: true,
      trim: true,
    },

    // دسته S
    s: {
      type: String,
      enum: ["S1", "S2", "S3", "S4", "S5", "Safety"],
      required: true,
    },

    description: { type: String, required: true, trim: true },

    beforeImages: [{ type: String }],
    afterImages: [{ type: String }],

    status: {
      type: String,
      enum: ["Fixed", "Not Fixed", "Incomplete", "Awaiting Review"],
      default: "Incomplete",
    },

    progress: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: String, default: "" },

    // تاریخ مشاهده (میلادی) برای مرتب‌سازی
    date: { type: Date, default: Date.now },

    // تاریخ مشاهده به شمسی (رشته) برای نمایش/اکسل
    viewDateJalali: { type: String, default: "" },

    // نام کاربری ادمین ثبت‌کننده
    createdBy: { type: String, default: "" },

    seenByAdmin: { type: Boolean, default: false },
    seenByUser: { type: Boolean, default: false },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedDate: { type: Date },
    hasNewResponse: { type: Boolean, default: false },
    adminReviewNote: { type: String, default: "" }, // نظر ادمین برای سرپرست
  },
  { timestamps: true }
);

export default mongoose.models.NonConformity ||
  mongoose.model("NonConformity", nonConformitySchema);
