import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // Plain text as per requirements
    role: { type: String, enum: ["Admin", "User"], required: true, default: "User" },
    department: {
      type: String,
      required: function () {
        return this.role === "User";
      },
      trim: true,
    },
    subunit: {
      type: String,
      trim: true,
    },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
