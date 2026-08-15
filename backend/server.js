import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import connectDB from "./config/db.js";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import noteRoutes from "./routes/note.routes.js";
import taskRoutes from "./routes/task.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CRM API is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);
// Lead routes
app.use("/api/leads", leadRoutes);
//contact routes
app.use("/api/contacts", contactRoutes);
//note routes
app.use("/api/notes", noteRoutes);
//task routes
app.use("/api/tasks", taskRoutes);
// ai-routes
app.use("/api/ai", aiRoutes);
//analyticscroutes
app.use("/api/analytics", analyticsRoutes);

// Error middleware - MUST be at the end
app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
