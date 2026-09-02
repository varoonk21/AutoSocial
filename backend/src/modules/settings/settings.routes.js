import express from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { getSettings, updateSettings } from "./settings.controller.js";

const router = express.Router();

router.get("/", requireAuth, getSettings);
router.put("/", requireAuth, updateSettings);

export default router;
