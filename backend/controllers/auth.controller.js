import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";

// ================= REGISTER =================
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, company } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    company: company || "",
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

// ================= LOGIN =================
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      avatar: user.avatar,
    },
  });
});
// ================= UPDATE PROFILE =================
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, company, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (company !== undefined) user.company = company;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

// ================= GET CURRENT USER =================
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
