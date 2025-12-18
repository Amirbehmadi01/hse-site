import express from "express";
import { login, getCurrentUser, changePassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/me", getCurrentUser);
router.post("/change-password", changePassword);

export default router;

