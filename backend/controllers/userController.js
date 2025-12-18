import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { name, username, password, role, department, subunit, createdBy } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({ message: "نام، نام کاربری، رمز و نقش الزامی است" });
    }

    if (role === "User" && (!department || !subunit)) {
      return res.status(400).json({ message: "برای سرپرست، واحد و زیرواحد الزامی است" });
    }

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({
      username: username.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({ message: "نام کاربری تکراری است" });
    }

    const user = await User.create({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      password, // Plain text storage as per requirements
      role,
      department: role === "User" ? department : undefined,
      subunit: role === "User" ? subunit : undefined,
      createdBy: createdBy || "",
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      department: user.department,
      subunit: user.subunit,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      password: user.password,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, role, department, subunit } = req.body;

    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (username !== undefined) update.username = username.toLowerCase().trim();
    if (password !== undefined) update.password = password;
    if (role !== undefined) update.role = role;
    if (department !== undefined) update.department = department;
    if (subunit !== undefined) update.subunit = subunit;

    const user = await User.findByIdAndUpdate(id, update, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

