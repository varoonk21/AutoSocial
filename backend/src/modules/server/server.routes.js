import express from "express";
import { getHealth, getConfig } from "./server.controller.js";

const router = express.Router();

router.get("/health", getHealth);
router.get("/config", getConfig);

export default router;
