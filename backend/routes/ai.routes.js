import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  getAIStatus,
  createLeadSummary,
  generateEmailDraft,
  getSalesInsights,
} from "../controllers/ai.controller.js";

const router = express.Router();

// All AI routes require authentication
router.use(authMiddleware);

// AI Status
router.get("/status", getAIStatus);

// Generate Lead Summary
router.post("/lead-summary", createLeadSummary);

// Generate Email
router.post("/generate-email", generateEmailDraft);

// Generate Sales Insights
router.post("/sales-insights", getSalesInsights);

export default router;
