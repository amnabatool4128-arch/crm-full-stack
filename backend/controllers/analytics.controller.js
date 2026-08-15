import Lead from "../models/Lead.js";
import Contact from "../models/Contact.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get Analytics Overview
export const getOverview = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  // Fetch leads, contacts and open tasks in parallel
  const [leads, contactCount, openTaskCount] = await Promise.all([
    Lead.find({ owner: ownerId }),
    Contact.countDocuments({ owner: ownerId }),
    Task.countDocuments({
      owner: ownerId,
      status: { $ne: "Completed" },
    }),
  ]);

  // Pipeline stages
  const stageNames = ["New", "Qualified", "Proposal", "Won", "Lost"];

  const pipeline = {};

  stageNames.forEach((stage) => {
    pipeline[stage] = {
      count: 0,
      value: 0,
    };
  });

  let totalPipelineValue = 0;
  let wonValue = 0;

  // Process leads
  for (const lead of leads) {
    const stage = lead.status || "New";
    const value = Number(lead.value) || 0;

    if (!pipeline[stage]) {
      pipeline[stage] = {
        count: 0,
        value: 0,
      };
    }

    pipeline[stage].count += 1;
    pipeline[stage].value += value;

    totalPipelineValue += value;

    if (stage === "Won") {
      wonValue += value;
    }
  }

  // Conversion rate
  const wonCount = pipeline.Won.count;
  const lostCount = pipeline.Lost.count;

  const closedDeals = wonCount + lostCount;

  const conversionRate =
    closedDeals > 0 ? Math.round((wonCount / closedDeals) * 100) : 0;

  // Last 6 months
  const months = getLast6Months();

  const trend = months.map((month) => ({
    key: month.key,
    label: month.label,
    leads: 0,
    wonValue: 0,
  }));

  // Build monthly trend
  for (const lead of leads) {
    if (!lead.createdAt) continue;

    const date = new Date(lead.createdAt);

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    const bucket = trend.find((item) => item.key === key);

    if (!bucket) continue;

    bucket.leads += 1;

    if (lead.status === "Won") {
      bucket.wonValue += Number(lead.value) || 0;
    }
  }

  // Recent leads
  const recentLeads = [...leads]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 6)
    .map((lead) => ({
      _id: lead._id,
      name: lead.name,
      company: lead.company,
      status: lead.status,
      priority: lead.priority,
      value: lead.value,
      updatedAt: lead.updatedAt,
    }));

  // Response
  res.status(200).json({
    success: true,

    stats: {
      totalLeads: leads.length,
      totalContacts: contactCount,
      openTasks: openTaskCount,
      totalPipelineValue,
      wonValue,
      conversionRate,
    },

    pipeline,

    trend,

    recentLeads,
  });
});

// Get last 6 months
const getLast6Months = () => {
  const months = [];

  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const key = `${year}-${String(month).padStart(2, "0")}`;

    const label = date.toLocaleString("en-US", {
      month: "short",
    });

    months.push({
      key,
      label,
    });
  }

  return months;
};
