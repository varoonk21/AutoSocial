import express from "express";
import { listPosts, getPost, createPost, updatePost, deletePost, getStats, getAnalytics, refreshPostInsights } from "../controllers/posts.controller.js";

const router = express.Router();

router.get("/stats", getStats);
router.get("/analytics", getAnalytics);
router.post("/refresh-insights", refreshPostInsights);
router.get("/", listPosts);
router.get("/:id", getPost);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
