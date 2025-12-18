import User from "../models/User.js";
import mongoose from "mongoose";

export const login = async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoState = mongoose.connection.readyState;
    if (mongoState !== 1) {
      const stateText = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
      }[mongoState] || "unknown";
      
      console.error(`[LOGIN] MongoDB not connected. State: ${stateText} (${mongoState})`);
      
      // If connecting, wait a bit and check again
      if (mongoState === 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (mongoose.connection.readyState === 1) {
          // Connected now, continue
        } else {
          return res.status(503).json({ 
            message: "در حال اتصال به دیتابیس. لطفاً چند ثانیه صبر کنید و دوباره تلاش کنید.",
            error: "MongoDB connecting"
          });
        }
      } else {
        return res.status(503).json({ 
          message: "خطا در اتصال به دیتابیس. لطفاً اتصال MongoDB را بررسی کنید.",
          error: "MongoDB not connected",
          hint: "بررسی کنید که IP شما در MongoDB Atlas whitelist شده باشد"
        });
      }
    }

    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Normalize input
    const normalizedUsername = username.toLowerCase().trim();
    const normalizedPassword = password.trim();

    if (!normalizedUsername || !normalizedPassword) {
      return res.status(400).json({ message: "Username and password cannot be empty" });
    }

    // Case-insensitive username search with error handling
    let user;
    try {
      user = await User.findOne({ 
        username: normalizedUsername 
      }).lean(); // Use lean() for better performance
    } catch (dbError) {
      console.error("[LOGIN] Database query error:", dbError);
      return res.status(500).json({ 
        message: "Database error. Please try again later.",
        error: dbError.message 
      });
    }

    // Debug logging for troubleshooting
    console.log(`[LOGIN] Attempt for username: "${normalizedUsername}"`);
    console.log(`[LOGIN] User found: ${user ? 'Yes' : 'No'}`);
    
    if (user) {
      console.log(`[LOGIN] Stored password: "${user.password}" (length: ${user.password?.length || 0})`);
      console.log(`[LOGIN] Provided password: "${normalizedPassword}" (length: ${normalizedPassword.length})`);
      console.log(`[LOGIN] Passwords match: ${user.password === normalizedPassword}`);
      console.log(`[LOGIN] User role: ${user.role}`);
    } else {
      // List all users for debugging (only if user not found)
      try {
        const allUsers = await User.find().select('username role').lean();
        console.log(`[LOGIN] Available users in database: ${allUsers.length > 0 ? allUsers.map(u => u.username).join(', ') : 'None'}`);
      } catch (err) {
        console.log(`[LOGIN] Could not fetch users list: ${err.message}`);
      }
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare passwords (plain text comparison)
    if (!user.password || user.password !== normalizedPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Return user data (without password)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      role: user.role,
      department: user.department || null,
      subunit: user.subunit || null,
    };

    console.log(`[LOGIN] Login successful for user: ${userData.username}`);
    return res.json({ message: "Login successful", user: userData });
    
  } catch (error) {
    console.error("[LOGIN] Unexpected error:", error);
    console.error("[LOGIN] Error stack:", error.stack);
    
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "An error occurred during login. Please try again." 
      : error.message;
    
    return res.status(500).json({ 
      message: "Error during login", 
      error: errorMessage 
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.body; // Frontend sends userId in request
    
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "User ID, current password, and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error: error.message });
  }
};
