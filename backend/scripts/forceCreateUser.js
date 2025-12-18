import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const forceCreateUser = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB\n");

    // Delete existing hse1 user if exists
    await User.deleteOne({ username: "hse1" });
    console.log("Deleted existing hse1 user if existed\n");

    // Create hse1 user
    const user = await User.create({
      username: "hse1",
      password: "1234",
      role: "Admin",
    });

    console.log("✅ User created successfully:");
    console.log(`   Username: ${user.username}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user._id}\n`);

    // Verify
    const verifyUser = await User.findOne({ username: "hse1" });
    console.log("✅ Verification:");
    console.log(`   User exists: ${verifyUser ? 'Yes' : 'No'}`);
    if (verifyUser) {
      console.log(`   Stored password: "${verifyUser.password}"`);
      console.log(`   Password matches '1234': ${verifyUser.password === '1234'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

forceCreateUser();

