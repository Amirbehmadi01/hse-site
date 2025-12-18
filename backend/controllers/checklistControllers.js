import Checklist from "../models/Checklist.js";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

// ✅ ایجاد چک‌لیست جدید
export const createChecklist = async (req, res) => {
  try {
    const { title, items, type, supervisorSignature } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: "عنوان و نوع چک‌لیست الزامی است" });
    }

    const parsedItems = items
      ? JSON.parse(items).map((item) => ({
          question: item?.question || "",
          answer: item?.answer || "",
          comment: item?.comment || "",
        }))
      : [];

    const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const newChecklist = new Checklist({
      title,
      type,
      items: parsedItems,
      image: imagePath,
      supervisorSignature: supervisorSignature || "",
    });

    await newChecklist.save();

    res.status(201).json({
      message: "✅ Checklist saved successfully",
      checklist: newChecklist,
    });
  } catch (error) {
    console.error("❌ Error creating checklist:", error);
    res.status(500).json({ message: "Error saving checklist", error });
  }
};

// ✅ دریافت تمام چک‌لیست‌ها
export const getAllChecklists = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    
    const checklists = await Checklist.find(filter).sort({ createdAt: -1 });

    // ❗ تبدیل JSON ناامن به آرایه واقعی برای اطمینان از سازگاری با فرانت
    const formatted = checklists.map((c) => ({
      ...c._doc,
      items:
        typeof c.items === "string"
          ? JSON.parse(c.items)
          : Array.isArray(c.items)
          ? c.items
          : [],
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Error fetching checklists:", error);
    res.status(500).json({ message: "Error fetching checklists", error });
  }
};

// ✅ دانلود اکسل از چک‌لیست
export const downloadChecklist = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist)
      return res.status(404).json({ message: "Checklist not found" });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Checklist");

    sheet.columns = [
      { header: "Question", key: "question", width: 40 },
      { header: "Answer", key: "answer", width: 20 },
      { header: "Comment", key: "comment", width: 30 },
    ];

    // ✅ اضافه کردن آیتم‌ها به شیت
    (checklist.items || []).forEach((item) => sheet.addRow(item));

    // ✅ جلوگیری از کاراکترهای غیرمجاز در نام فایل
    const safeTitle = (checklist.title || "Checklist").replace(
      /[^a-zA-Z0-9آ-ی]/g,
      "_"
    );
    const filePath = path.join("uploads", `${safeTitle}.xlsx`);

    await workbook.xlsx.writeFile(filePath);

    // ✅ ارسال و حذف فایل موقت
    res.download(filePath, (err) => {
      if (err) console.error("Download error:", err);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error("File cleanup error:", unlinkErr);
      });
    });
  } catch (error) {
    console.error("❌ Error downloading checklist:", error);
    res.status(500).json({ message: "Error downloading checklist", error });
  }
};