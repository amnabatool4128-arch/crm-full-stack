import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/note.controller.js";

const router = express.Router();

// Create Note
router.post("/", authMiddleware, createNote);

// Get All Notes
router.get("/", authMiddleware, getNotes);

// Get Single Note
router.get("/:id", authMiddleware, getNote);

// Update Note
router.put("/:id", authMiddleware, updateNote);

// Delete Note
router.delete("/:id", authMiddleware, deleteNote);

export default router;
