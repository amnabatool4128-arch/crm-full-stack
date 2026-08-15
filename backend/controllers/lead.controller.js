import Lead from "../models/Lead.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Get all leads
export const getLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find({ owner: req.user._id }).sort({
    updatedAt: -1,
  });

  res.status(200).json({
    success: true,
    leads,
  });
});

// Get single lead
export const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  res.status(200).json({
    success: true,
    lead,
  });
});

// Create lead
export const createLead = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    company,
    status,
    priority,
    source,
    value,
    notes,
  } = req.body;

  if (!name) {
    throw new ApiError(400, "Lead name is required");
  }

  const lead = await Lead.create({
    name,
    email,
    phone,
    company,
    status: status || "New",
    priority: priority || "Medium",
    source: source || "Website",
    value: Number(value) || 0,
    notes,
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Lead created successfully",
    lead,
  });
});

// Update lead
export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  const allowedFields = [
    "name",
    "email",
    "phone",
    "company",
    "status",
    "priority",
    "source",
    "value",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      lead[field] =
        field === "value" ? Number(req.body[field]) || 0 : req.body[field];
    }
  });

  await lead.save();

  res.status(200).json({
    success: true,
    message: "Lead updated successfully",
    lead,
  });
});

// Delete lead
export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  res.status(200).json({
    success: true,
    message: "Lead deleted successfully",
  });
});
// Reorder lead
export const reorderLead = asyncHandler(async (req, res) => {
  const { status, order } = req.body;

  const lead = await Lead.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  lead.status = status;

  if (order !== undefined) {
    lead.order = Number(order);
  }

  await lead.save();

  res.status(200).json({
    success: true,
    message: "Lead reordered successfully",
    lead,
  });
});