import express from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody, validateParams } from "../../middleware/validate.middleware.js";
import { generateImageHandler, listMedia, deleteMediaHandler, getUploadUrlHandler, saveMetadataHandler } from "./media.controller.js";
import { uploadUrlSchema, saveMetadataSchema, mediaIdParamSchema } from "./media.validation.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listMedia);
router.post("/", validateBody(saveMetadataSchema), saveMetadataHandler);
router.delete("/:id", validateParams(mediaIdParamSchema), deleteMediaHandler);
router.post("/upload-url", validateBody(uploadUrlSchema), getUploadUrlHandler);
router.post("/generate-image", generateImageHandler);

export default router;
