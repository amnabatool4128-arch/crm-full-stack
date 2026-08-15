import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      status,
      priority,
      relatedLead,
      relatedContact,
    } = req.body;

    const task = await Task.create({
      owner: req.user._id,
      title,
      description,
      dueDate: dueDate || null,
      status: status || "Pending",
      priority: priority || "Medium",
      relatedLead: relatedLead || null,
      relatedContact: relatedContact || null,
      completedAt: status === "Completed" ? new Date() : null,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// Get All Tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      owner: req.user._id,
    })
      .populate("relatedLead")
      .populate("relatedContact")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

// Get Single Task
export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    })
      .populate("relatedLead")
      .populate("relatedContact");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
      error: error.message,
    });
  }
};

// Update Task
export const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      status,
      priority,
      relatedLead,
      relatedContact,
    } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate ?? task.dueDate;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.relatedLead = relatedLead ?? task.relatedLead;
    task.relatedContact = relatedContact ?? task.relatedContact;

    if (task.status === "Completed") {
      if (!task.completedAt) {
        task.completedAt = new Date();
      }
    } else {
      task.completedAt = null;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};
