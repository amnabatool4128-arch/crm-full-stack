import express from "express";

import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contact.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// All contact routes are protected
router.use(authMiddleware);

// Get all contacts
router.get("/", getContacts);

// Get single contact
router.get("/:id", getContact);

// Create contact
router.post("/", createContact);

// Update contact
router.put("/:id", updateContact);

// Delete contact
router.delete("/:id", deleteContact);

export default router;
