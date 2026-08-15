import express from "express";

import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  reorderLead,
} from "../controllers/lead.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getLeads);
router.get("/:id", getLead);
router.post("/", createLead);
router.put("/:id", updateLead);
router.patch("/:id/reorder", reorderLead);
router.delete("/:id", deleteLead);

export default router;
