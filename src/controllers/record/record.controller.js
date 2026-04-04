const recordService = require("../../services/record/record.service");

exports.createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user.id);
    res.status(201).json({
      message: "Record created successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecords = async (req, res, next) => {
  try {
    const result = await recordService.getRecords(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
};

exports.updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);
    res.json({
      message: "Record updated successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.params.id);
    res.json({
      message: "Record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};