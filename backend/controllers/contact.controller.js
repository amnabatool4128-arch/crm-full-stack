import Contact from "../models/Contact.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Get all contacts
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({
    owner: req.user._id,
  }).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    contacts,
  });
});

// Get single contact
export const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  res.status(200).json({
    success: true,
    contact,
  });
});

// Create contact
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, company, jobTitle, lead, notes, favorite } =
    req.body;

  if (!name) {
    throw new ApiError(400, "Contact name is required");
  }

  const contact = await Contact.create({
    owner: req.user._id,
    name,
    email,
    phone,
    company,
    jobTitle,
    lead,
    notes,
    favorite: Boolean(favorite),
  });

  res.status(201).json({
    success: true,
    message: "Contact created successfully",
    contact,
  });
});

// Update contact
export const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  const allowedFields = [
    "name",
    "email",
    "phone",
    "company",
    "jobTitle",
    "lead",
    "notes",
    "favorite",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      contact[field] = req.body[field];
    }
  });

  await contact.save();

  res.status(200).json({
    success: true,
    message: "Contact updated successfully",
    contact,
  });
});

// Delete contact
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  res.status(200).json({
    success: true,
    message: "Contact deleted successfully",
  });
});
