const dashboardService = require("../../services/dashboard/dashboard.service");

exports.getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryBreakdown();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getRecentTransactions = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentTransactions();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyTrends();
    res.json(data);
  } catch (error) {
    next(error);
  }
};