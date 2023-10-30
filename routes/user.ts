import { Router } from "express";
import { initiateReplies, userActions } from "../controllers/user";

const router = Router();
router.get("/", userActions);
router.get("/initiate", initiateReplies);

export default router;
