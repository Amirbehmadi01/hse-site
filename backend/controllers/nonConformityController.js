import NonConformity from "../models/NonConformity.js";
import User from "../models/User.js";

// تاریخ شمسی به صورت رشته (برای ذخیره/اکسل)
const toJalaliString = (date = new Date()) => {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
};

// Helper: group by Persian month using fa-IR locale
function getPersianMonthKey(date) {
  try {
    const d = new Date(date);
    const month = d.toLocaleDateString("fa-IR", { year: "numeric", month: "long" });
    return month; // e.g., "فروردین 1403"
  } catch {
    return "نامشخص";
  }
}

// Get current month start and end dates
function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

// Create non-conformance
export const createNonConformity = async (req, res) => {
  try {
    const { unit, department, subunit, s, description, createdBy } = req.body;
    const beforeFiles = (req.files?.beforeImages || []).map((f) => "/uploads/nonconformities/" + f.filename);

    const resolvedUnit = unit || department;

    if (!resolvedUnit || !subunit || !s || !description) {
      return res.status(400).json({ message: "unit, subunit, S و شرح الزامی است" });
    }

    const now = new Date();

    const created = await NonConformity.create({
      unit: resolvedUnit,
      department: department || resolvedUnit,
      subunit,
      s,
      description,
      beforeImages: beforeFiles,
      status: "Incomplete",
      progress: 0,
      date: now,
      viewDateJalali: toJalaliString(now),
      createdBy: createdBy || "",
    });

    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: "Error creating non-conformity", error: e.message });
  }
};

// Get non-conformances (with filters for admin/user)
export const getNonConformities = async (req, res) => {
  try {
    const { department, role, userId, currentMonth, from, to, unit, subunit, mode } = req.query;
    const filter = {};

    // واحد/زیرواحد درخواستی
    let resolvedUnit = unit || department;
    let resolvedSubunit = subunit;

    // اگر سرپرست است، فیلتر را فقط بر اساس زیرواحد اختصاص‌یافته خودش اعمال کنیم
    if (role === "User") {
      if (!userId) {
        return res.status(400).json({ message: "userId الزامی است برای نقش سرپرست" });
      }
      const supervisor = await User.findById(userId).lean();
      if (!supervisor) {
        return res.status(404).json({ message: "سرپرست یافت نشد" });
      }
      resolvedUnit = supervisor.department || resolvedUnit;
      resolvedSubunit = supervisor.subunit || resolvedSubunit;
    }

    if (resolvedUnit) {
      filter.$or = [{ unit: resolvedUnit }, { department: resolvedUnit }];
    }
    if (resolvedSubunit) {
      filter.subunit = resolvedSubunit;
    }

    if (currentMonth === "true") {
      const { start, end } = getCurrentMonthRange();
      filter.date = { $gte: start, $lte: end };
    }

    if (from || to) {
      filter.date = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lte: new Date(to) } : {}),
      };
    }

    const items = await NonConformity.find(filter)
      .populate("reviewedBy", "username")
      .sort({ date: -1 });

    // If user, mark items as seen
    if (role === "User" && userId) {
      const itemIds = items.map((item) => item._id);
      await NonConformity.updateMany({ _id: { $in: itemIds } }, { $set: { seenByUser: true } });
    }

    // حالت فلت برای جدول جدید
    if (mode === "flat") {
      return res.json(items);
    }

    // Group by Persian month
    const grouped = {};
    for (const it of items) {
      const key = getPersianMonthKey(it.date);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(it);
    }

    // Supervisor score per month
    const result = Object.entries(grouped).map(([monthKey, arr]) => {
      const total = arr.length;
      const fixed = arr.filter((x) => x.status === "Fixed").length;
      const supervisorScore = total ? Math.round((fixed / total) * 100) : 0;
      return { month: monthKey, supervisorScore, items: arr };
    });

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: "Error fetching non-conformities", error: e.message });
  }
};

// Get non-conformances with new responses (for admin)
export const getNonConformitiesWithResponses = async (req, res) => {
  try {
    const items = await NonConformity.find({ hasNewResponse: true, status: "Awaiting Review" })
      .populate("reviewedBy", "username")
      .sort({ date: -1 });

    // Group by subunit to تفکیک بر اساس زیرواحد
    const grouped = {};
    for (const item of items) {
      const key = item.subunit || item.department || "نامشخص";
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    }

    res.json(grouped);
  } catch (e) {
    res.status(500).json({ message: "Error fetching non-conformities with responses", error: e.message });
  }
};

// Update non-conformance (user submits response)
export const updateNonConformity = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress, notes, afterImages, submitResponse, unit, subunit, description, s } = req.body;
    const afterFiles = (req.files?.afterImages || []).map((f) => "/uploads/nonconformities/" + f.filename);

    const existing = await NonConformity.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }

    const update = {};
    
    // اگر کاربر پاسخ می‌دهد
    if (submitResponse === "true") {
      if (afterFiles.length > 0) {
        update.afterImages = [...(existing.afterImages || []), ...afterFiles];
      }
      if (notes !== undefined) {
        update.notes = notes;
      }
      update.status = "Awaiting Review";
      update.hasNewResponse = true;
      update.seenByAdmin = false; // Admin hasn't seen the new response
    } else {
      // ادمین بروزرسانی می‌کند
      if (status !== undefined) update.status = status;
      if (typeof progress !== "undefined") update.progress = Number(progress);
      if (notes !== undefined) update.notes = notes;
      if (description !== undefined) update.description = description;
      if (s !== undefined) update.s = s;
      if (unit) {
        update.unit = unit;
        update.department = unit;
      }
      if (subunit) update.subunit = subunit;
      if (afterFiles.length > 0) {
        update.afterImages = [...(existing.afterImages || []), ...afterFiles];
      }
    }

    // هر بار ویرایش، تاریخ مشاهده شمسی به‌روزرسانی شود
    update.viewDateJalali = toJalaliString(new Date());

    const updated = await NonConformity.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate("reviewedBy", "username");
    
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: "Error updating non-conformity", error: e.message });
  }
};

// Approve response
export const approveResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, reviewNote } = req.body;

    const updated = await NonConformity.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "Fixed",
          progress: 100,
          hasNewResponse: false,
          seenByAdmin: true,
          reviewedBy: adminId,
          reviewedDate: new Date(),
          adminReviewNote: reviewNote || "",
        },
      },
      { new: true }
    ).populate("reviewedBy", "username");

    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: "Error approving response", error: e.message });
  }
};

// Reject response
export const rejectResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, reviewNote } = req.body;

    const existing = await NonConformity.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }

    // Revert to previous status or keep as Incomplete
    const updated = await NonConformity.findByIdAndUpdate(
      id,
      {
        $set: {
          status: existing.status === "Awaiting Review" ? "Incomplete" : existing.status,
          hasNewResponse: false,
          seenByAdmin: true,
          reviewedBy: adminId,
          reviewedDate: new Date(),
          adminReviewNote: reviewNote || "",
        },
      },
      { new: true }
    ).populate("reviewedBy", "username");

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: "Error rejecting response", error: e.message });
  }
};

// Mark as seen by admin
export const markSeenByAdmin = async (req, res) => {
  try {
    const { ids } = req.body; // Array of IDs
    await NonConformity.updateMany(
      { _id: { $in: ids } },
      { $set: { seenByAdmin: true } }
    );
    res.json({ message: "Marked as seen" });
  } catch (e) {
    res.status(500).json({ message: "Error marking as seen", error: e.message });
  }
};

// Delete non-conformance
export const deleteNonConformity = async (req, res) => {
  try {
    const { id } = req.params;
    await NonConformity.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: "Error deleting non-conformity", error: e.message });
  }
};

// Get notifications for user
export const getUserNotifications = async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    const { start, end } = getCurrentMonthRange();
    
    // Get items with new reviews (approved/rejected) in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const reviewedItems = await NonConformity.find({
      department,
      date: { $gte: start, $lte: end },
      reviewedDate: { $gte: sevenDaysAgo },
      reviewedBy: { $exists: true },
    })
      .populate("reviewedBy", "username")
      .sort({ reviewedDate: -1 });

    // Get items not yet seen by user
    const unseenItems = await NonConformity.find({
      department,
      date: { $gte: start, $lte: end },
      seenByUser: false,
    }).countDocuments();

    res.json({
      reviewedItems: reviewedItems.slice(0, 10), // Last 10 reviews
      unseenCount: unseenItems,
    });
  } catch (e) {
    res.status(500).json({ message: "Error fetching notifications", error: e.message });
  }
};


// //14/9

// import NonConformity from "../models/NonConformity.js";

// // Helper: group by Persian month using fa-IR locale
// function getPersianMonthKey(date) {
//   try {
//     const d = new Date(date);
//     const month = d.toLocaleDateString("fa-IR", { year: "numeric", month: "long" });
//     return month;
//   } catch {
//     return "نامشخص";
//   }
// }

// function getCurrentMonthRange() {
//   const now = new Date();
//   const start = new Date(now.getFullYear(), now.getMonth(), 1);
//   const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
//   return { start, end };
// }

// // CREATE
// export const createNonConformity = async (req, res) => {
//   try {
//     const { unit, department, subunit, s, description } = req.body;

//     if (!unit || !department || !subunit || !s || !description) {
//       return res.status(400).json({
//         message: "Unit, department, subunit, S and description are required"
//       });
//     }

//     const beforeFiles = (req.files?.beforeImages || []).map(
//       (f) => "/uploads/nonconformities/" + f.filename
//     );

//     const created = await NonConformity.create({
//       unit,
//       department,
//       subunit,
//       s,
//       description,
//       beforeImages: beforeFiles,
//       status: "Incomplete",
//       progress: 0,
//     });

//     res.status(201).json(created);

//   } catch (e) {
//     res.status(500).json({ 
//       message: "Error creating non-conformity", 
//       error: e.message 
//     });
//   }
// };

// // GET (NO CHANGES — only filtered by month/department as before)
// export const getNonConformities = async (req, res) => {
//   try {
//     const { month, department, role, userId, currentMonth } = req.query;
//     const filter = {};

//     if (role === "User" && department) {
//       filter.subunit = department; // 🔥 Supervisor sees only own subunit
//     }

//     if (currentMonth === "true") {
//       const { start, end } = getCurrentMonthRange();
//       filter.date = { $gte: start, $lte: end };
//     }

//     const items = await NonConformity.find(filter)
//       .populate("reviewedBy", "username")
//       .sort({ date: -1 });

//     if (role === "User" && userId) {
//       const itemIds = items.map(item => item._id);
//       await NonConformity.updateMany(
//         { _id: { $in: itemIds } },
//         { $set: { seenByUser: true } }
//       );
//     }

//     const grouped = {};
//     for (const it of items) {
//       const key = getPersianMonthKey(it.date);
//       if (!grouped[key]) grouped[key] = [];
//       grouped[key].push(it);
//     }

//     const result = Object.entries(grouped).map(([monthKey, arr]) => {
//       const total = arr.length;
//       const fixed = arr.filter((x) => x.status === "Fixed").length;
//       const supervisorScore = total ? Math.round((fixed / total) * 100) : 0;
//       return { month: monthKey, supervisorScore, items: arr };
//     });

//     res.json(result);

//   } catch (e) {
//     res.status(500).json({
//       message: "Error fetching non-conformities",
//       error: e.message
//     });
//   }
// };

// // (All other functions remain unchanged)
// export const getNonConformitiesWithResponses = async (req, res) => {
//   try {
//     const items = await NonConformity.find({
//       hasNewResponse: true,
//       status: "Awaiting Review"
//     })
//       .populate("reviewedBy", "username")
//       .sort({ date: -1 });

//     const grouped = {};
//     for (const item of items) {
//       if (!grouped[item.department]) {
//         grouped[item.department] = [];
//       }
//       grouped[item.department].push(item);
//     }

//     res.json(grouped);
//   } catch (e) {
//     res.status(500).json({ message: "Error fetching non-conformities with responses", error: e.message });
//   }
// };

// // UPDATE
// export const updateNonConformity = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, progress, notes, afterImages, submitResponse } = req.body;

//     const afterFiles = (req.files?.afterImages || []).map(
//       (f) => "/uploads/nonconformities/" + f.filename
//     );

//     const existing = await NonConformity.findById(id);
//     if (!existing) return res.status(404).json({ message: "Not found" });

//     const update = {};

//     if (submitResponse === "true") {
//       if (afterFiles.length > 0)
//         update.afterImages = [...(existing.afterImages || []), ...afterFiles];

//       if (notes !== undefined) update.notes = notes;

//       update.status = "Awaiting Review";
//       update.hasNewResponse = true;
//       update.seenByAdmin = false;

//     } else {
//       if (status !== undefined) update.status = status;
//       if (typeof progress !== "undefined") update.progress = Number(progress);
//       if (notes !== undefined) update.notes = notes;
//       if (afterFiles.length > 0)
//         update.afterImages = [...(existing.afterImages || []), ...afterFiles];
//     }

//     const updated = await NonConformity.findByIdAndUpdate(
//       id,
//       { $set: update },
//       { new: true }
//     ).populate("reviewedBy", "username");

//     res.json(updated);

//   } catch (e) {
//     res.status(500).json({ message: "Error updating non-conformity", error: e.message });
//   }
// };

// // NEW FUNCTION: approveResponse
// export const approveResponse = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const updated = await NonConformity.findByIdAndUpdate(
//       id,
//       { $set: { status: "Approved", hasNewResponse: false } },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ message: "Not found" });
//     }

//     res.json(updated);
//   } catch (e) {
//     res.status(500).json({ message: "Error approving response", error: e.message });
//   }
// };

// // NEW FUNCTION: deleteNonConformity
// export const deleteNonConformity = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deleted = await NonConformity.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({ message: "Not found" });
//     }

//     res.json({ message: "Non-conformity deleted successfully" });
//   } catch (e) {
//     res.status(500).json({ message: "Error deleting non-conformity", error: e.message });
//   }
// };
