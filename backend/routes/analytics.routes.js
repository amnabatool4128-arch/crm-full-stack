import express from "express";

import { getOverview } from "../controllers/analytics.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all analytics routes
router.use(authMiddleware);

// Analytics overview
router.get("/overview", getOverview);

export default router;
