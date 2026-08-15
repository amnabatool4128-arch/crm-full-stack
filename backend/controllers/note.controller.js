import Note from "../models/Note.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"

// Create Note
export const createNote = async (req, res) => {
  try {
    const { content, lead, contact, pinned } = req.body;

    const note = await Note.create({
      owner: req.user._id,
      content,
      lead: lead || null,
      contact: contact || null,
      pinned: pinned || false,
    });

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create note",
      error: error.message,
    });
  }
};

// Get All Notes
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      owner: req.user._id,
    })
      .populate("lead")
      .populate("contact")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
      error: error.message,
    });
  }
};

// Get Single Note
export const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id,
    })
      .populate("lead")
      .populate("contact");

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch note",
      error: error.message,
    });
  }
};

// Update Note
export const updateNote = async (req, res) => {
  try {
    const { content, lead, contact, pinned } = req.body;

    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
      },
      {
        content,
        lead: lead || null,
        contact: contact || null,
        pinned,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update note",
      error: error.message,
    });
  }
};

// Delete Note
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message,
    });
  }
};
