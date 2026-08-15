import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

const router = express.Router();

// Create Task
router.post("/", authMiddleware, createTask);

// Get All Tasks
router.get("/", authMiddleware, getTasks);

// Get Single Task
router.get("/:id", authMiddleware, getTask);

// Update Task
router.put("/:id", authMiddleware, updateTask);

// Delete Task
router.delete("/:id", authMiddleware, deleteTask);

export default router;
