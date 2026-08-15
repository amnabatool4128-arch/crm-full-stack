import Lead from "../models/Lead.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

import {
  isAIConfigured,
  generateLeadSummary,
  generateEmail,
  generateSalesInsights,
} from "../services/ai.service.js";

// Resolve Lead
const resolveLead = async (req) => {
  const { leadId, lead } = req.body;

  // If leadId is provided
  if (leadId) {
    const foundLead = await Lead.findOne({
      _id: leadId,
      owner: req.user._id,
    });

    if (!foundLead) {
      throw new ApiError(404, "Lead not found");
    }

    return foundLead;
  }

  // If inline lead object is provided
  if (lead && typeof lead === "object") {
    return lead;
  }

  throw new ApiError(400, "Please provide either leadId or lead object");
};

// AI Status
export const getAIStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    configured: isAIConfigured(),
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  });
});

// Generate Lead Summary
export const createLeadSummary = asyncHandler(async (req, res) => {
  const lead = await resolveLead(req);

  const result = await generateLeadSummary(lead);

  // Save AI result if this is a real database lead
  if (req.body.leadId) {
    await Lead.findOneAndUpdate(
      {
        _id: req.body.leadId,
        owner: req.user._id,
      },
      {
        aiSummary: result.summary,
        aiRiskScore: result.riskScore,
      },
    );
  }

  res.status(200).json({
    success: true,
    summary: result,
  });
});

// Generate Email Draft
export const generateEmailDraft = asyncHandler(async (req, res) => {
  const lead = await resolveLead(req);

  const { purpose = "Follow-up", tone = "friendly and professional" } =
    req.body;

  const result = await generateEmail({
    senderName: req.user.name,
    senderCompany: req.user.company,
    purpose,
    tone,
    recipient: lead,
  });

  res.status(200).json({
    success: true,
    email: result,
  });
});

// Generate Sales Insights
export const getSalesInsights = asyncHandler(async (req, res) => {
  let stats = req.body?.stats;

  // If stats were not provided by frontend,
  // build them from user's leads
  if (!stats) {
    const leads = await Lead.find({
      owner: req.user._id,
    }).lean();

    stats = buildPipelineStats(leads);
  }
  console.log("PIPELINE STATS:", stats);



  const result = await generateSalesInsights(stats);

  res.status(200).json({
    success: true,
    ...result,
  });
});


// Build Pipeline Stats
const buildPipelineStats = (leads) => {
  const stages = {};

  let totalPipelineValue = 0;
  let wonDeals = 0;
  let closedDeals = 0;

  for (const lead of leads) {
    const stage = lead.status || "Unknown";
    const value = Number(lead.value) || 0;

    if (!stages[stage]) {
      stages[stage] = {
        count: 0,
        value: 0,
      };
    }

    stages[stage].count += 1;
    stages[stage].value += value;

    totalPipelineValue += value;

    // Calculate win rate from closed deals
    if (stage.toLowerCase() === "won" || stage.toLowerCase() === "lost") {
      closedDeals += 1;

      if (stage.toLowerCase() === "won") {
        wonDeals += 1;
      }
    }
  }

  const winRate =
    closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;

  return {
    totalLeads: leads.length,
    totalPipelineValue,
    winRate,
    stages,
  };
};
