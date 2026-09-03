import express from "express";
import { generatePostsHandler, separatePostsHandler, generateImageHandler } from "./ai.controller.js";

const router = express.Router();

router.post("/generate", generatePostsHandler);
router.post("/separate", separatePostsHandler);
router.post("/generate-image", generateImageHandler);

export default router;
