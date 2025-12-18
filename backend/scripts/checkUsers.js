import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const checkUsers = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB\n");

    // Get all users
    const users = await User.find().select("username password role department");
    
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log("❌ No users found in database!");
      console.log("💡 Run 'npm run init-admins' to create admin users.\n");
      process.exit(0);
    }

    console.log("📋 Users list:");
    console.log("─".repeat(80));
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department || "N/A"}`);
      console.log(`   ID: ${user._id}`);
      console.log("─".repeat(80));
    });

    // Check specific user
    const hse1 = await User.findOne({ username: "hse1" });
    if (hse1) {
      console.log("\n✅ User 'hse1' exists:");
      console.log(`   Password stored: "${hse1.password}"`);
      console.log(`   Password length: ${hse1.password.length}`);
      console.log(`   Expected password: "1234"`);
      console.log(`   Match: ${hse1.password === "1234"}`);
    } else {
      console.log("\n❌ User 'hse1' not found!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking users:", error);
    process.exit(1);
  }
};

checkUsers();

