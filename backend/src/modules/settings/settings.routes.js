import express from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      name: user.name || "",
      email: user.email,
      notifications: {
        postPublished: user.notifications?.postPublished ?? true,
        postFailed: user.notifications?.postFailed ?? true,
        tokenExpiring: user.notifications?.tokenExpiring ?? true,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { name, notifications } = req.body;

    if (name !== undefined) {
      user.name = name;
    }

    if (notifications) {
      if (!user.notifications) {
        user.notifications = {};
      }
      if (notifications.postPublished !== undefined) {
        user.notifications.postPublished = notifications.postPublished;
      }
      if (notifications.postFailed !== undefined) {
        user.notifications.postFailed = notifications.postFailed;
      }
      if (notifications.tokenExpiring !== undefined) {
        user.notifications.tokenExpiring = notifications.tokenExpiring;
      }
    }

    await user.save();

    res.json({
      name: user.name || "",
      email: user.email,
      notifications: {
        postPublished: user.notifications?.postPublished ?? true,
        postFailed: user.notifications?.postFailed ?? true,
        tokenExpiring: user.notifications?.tokenExpiring ?? true,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
