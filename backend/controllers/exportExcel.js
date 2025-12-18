import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import NonConformity from "../models/NonConformity.js";

const jalaliString = (date) =>
  new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

// دانلود اکسل بر اساس واحد/زیرواحد و ماه (yyyy-MM از فرانت)
export const exportNonConformitiesExcel = async (req, res) => {
  try {
    const { unit, subUnit, month } = req.params;

    // ماه به صورت 2025-03 از فرانت می‌آید
    const [gYear, gMonth] = month.split("-").map(Number);
    const startDate = new Date(gYear, gMonth - 1, 1);
    const endDate = new Date(gYear, gMonth, 0, 23, 59, 59);

    const query = {
      $or: [{ unit }, { department: unit }],
      date: { $gte: startDate, $lte: endDate },
    };

    if (subUnit && subUnit !== "null") query.subunit = subUnit;

    const records = await NonConformity.find(query).lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("عدم انطباق");

    // ستون‌ها به ترتیب خواسته شده
    sheet.columns = [
      { header: "ردیف", key: "row", width: 8 },
      { header: "S", key: "s", width: 10 },
      { header: "شرح عدم انطباق", key: "description", width: 40 },
      { header: "تاریخ مشاهده", key: "viewDate", width: 18 },
      { header: "وضعیت", key: "status", width: 16 },
      { header: "درصد پیشرفت", key: "progress", width: 14 },
      { header: "تصویر قبل از اصلاح", key: "before", width: 24 },
      { header: "تصویر پس از اصلاح", key: "after", width: 24 },
      { header: "توضیحات", key: "notes", width: 30 },
    ];

    const addImageToSheet = (imagePath, col, row) => {
      try {
        const cleanPath = imagePath.replace(/^\//, "");
        const absPath = path.isAbsolute(cleanPath)
          ? cleanPath
          : path.join(process.cwd(), cleanPath);
        if (!fs.existsSync(absPath)) return null;
        const buffer = fs.readFileSync(absPath);
        const ext = path.extname(absPath).replace(".", "") || "png";
        const imgId = workbook.addImage({ buffer, extension: ext });
        sheet.addImage(imgId, {
          tl: { col: col - 1 + 0.1, row: row - 1 + 0.1 },
          ext: { width: 120, height: 90 },
          editAs: "oneCell",
        });
        sheet.getRow(row).height = Math.max(sheet.getRow(row).height || 0, 75);
        sheet.getColumn(col).width = Math.max(sheet.getColumn(col).width || 24, 24);
        return imgId;
      } catch {
        return null;
      }
    };

    records.forEach((r, idx) => {
      const excelRowNumber = idx + 2; // چون ردیف 1 برای header است
      sheet.addRow({
        row: idx + 1,
        s: r.s,
        description: r.description,
        viewDate: r.viewDateJalali || jalaliString(new Date(r.date)),
        status: r.status,
        progress: r.progress,
        notes: r.notes || "",
      });

      // تصاویر - اولین مورد هرکدام
      if (Array.isArray(r.beforeImages) && r.beforeImages[0]) {
        addImageToSheet(r.beforeImages[0], 7, excelRowNumber);
      }
      if (Array.isArray(r.afterImages) && r.afterImages[0]) {
        addImageToSheet(r.afterImages[0], 8, excelRowNumber);
      }
    });

    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=nonconformities-${month}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({ message: "Error generating Excel file" });
  }
};
