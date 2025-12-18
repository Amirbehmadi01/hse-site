import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js"; // مسیر مدل User

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    // چک کن اگر کاربر hse0 وجود نداره، اضافه کن
    const existing = await User.findOne({ username: "hse0" });
    if (!existing) {
      const user = await User.create({
        username: "hse0",
        password: "1234",
        role: "Admin"
      });
      console.log("User hse0 created:", user);
    } else {
      console.log("User hse0 already exists");
    }

    mongoose.connection.close();
  })
  .catch(err => console.error(err));