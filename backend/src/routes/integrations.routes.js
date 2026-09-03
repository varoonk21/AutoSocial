import express from "express";
import {
  listIntegrations,
  getOAuthUrl,
  oauthCallback,
  getPages,
  savePage,
  deleteIntegration,
  toggleDisable,
} from "../controllers/integrations.controller.js";

const router = express.Router();

router.get("/list", listIntegrations);
router.get("/social/:provider", getOAuthUrl);
router.get("/social/:provider/callback", oauthCallback);
router.get("/social/:provider/pages", getPages);
router.post("/social/:provider/page", savePage);
router.delete("/:id", deleteIntegration);
router.put("/:id/disable", toggleDisable);

export default router;
