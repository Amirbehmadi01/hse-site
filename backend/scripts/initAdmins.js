import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const initAdmins = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const adminUsers = [
      { username: "hse0", password: "1234", role: "Admin" },
      { username: "hse1", password: "1234", role: "Admin" },
      { username: "hse2", password: "1234", role: "Admin" },
      { username: "hse3", password: "1234", role: "Admin" },
    ];

    for (const adminData of adminUsers) {
      const existingUser = await User.findOne({ 
        username: adminData.username.toLowerCase() 
      });

      if (existingUser) {
        console.log(`Admin ${adminData.username} already exists, skipping...`);
      } else {
        await User.create({
          username: adminData.username.toLowerCase(),
          password: adminData.password,
          role: adminData.role,
        });
        console.log(`✅ Created admin: ${adminData.username}`);
      }
    }

    console.log("\n✅ Admin initialization completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing admins:", error);
    process.exit(1);
  }
};

initAdmins();

