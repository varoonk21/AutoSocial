import express from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { brandKitSchema } from "./brandkit.validation.js";
import { getBrandKit, upsertBrandKit, deleteBrandKit } from "./brandkit.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getBrandKit);
router.put("/", validateBody(brandKitSchema), upsertBrandKit);
router.delete("/", deleteBrandKit);

export default router;
