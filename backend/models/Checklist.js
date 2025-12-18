import mongoose from "mongoose";

const checklistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {type: String, required: true},
    items: [
      {
        question: { type: String, required: true },
        answer: { type: String, default: "" }, // optional
        comment: { type: String, default: "" }, // optional
      },
    ],
    image: { type: String, default: "" }, // optional
    supervisorSignature: { type: String, default: "" }, // supervisor signature data URL
  },
  { timestamps: true }
);

export default mongoose.model("Checklist", checklistSchema);