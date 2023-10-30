import { Router } from "express";
import { authenticate, logout } from "../controllers/auth";

const router = Router();
router.get("/", authenticate);
router.get("/logout", logout);

export default router;
