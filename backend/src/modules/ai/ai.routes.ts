import express from "express";
import { validateBody } from "../../middleware/validate.middleware.js";
import {
  generatePostsSchema,
  separatePostsSchema,
  generateImageSchema,
  generateContentFromImageSchema,
  enhanceContentSchema,
} from "./ai.validation.js";
import {
  generatePostsHandler,
  separatePostsHandler,
  generateImageHandler,
  generateContentFromImageHandler,
  enhanceContentHandler,
} from "./ai.controller.js";

const router = express.Router();

router.post("/generate", validateBody(generatePostsSchema), generatePostsHandler);
router.post("/separate", validateBody(separatePostsSchema), separatePostsHandler);
router.post("/generate-image", validateBody(generateImageSchema), generateImageHandler);
router.post("/generate-content-from-image", validateBody(generateContentFromImageSchema), generateContentFromImageHandler);
router.post("/enhance", validateBody(enhanceContentSchema), enhanceContentHandler);

export default router;
