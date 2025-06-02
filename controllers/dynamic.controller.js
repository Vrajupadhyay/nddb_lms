const createModel = require("../models/record.model");
const validateData = require("../utils/dynamicValidator");

exports.createRecord = async (req, res) => {
  try {
    const modelName = req.params.model;
    const Model = await createModel(modelName);
    const data = req.body;

    // Save uploaded file paths in data
    for (const key in req.files || {}) {
      if (req.files[key][0]) {
        data[key] = `/uploads/${modelName}/${data.courseId || "general"}/${
          req.files[key][0].filename
        }`;
      }
    }

    // Validate
    const errors = await validateData(modelName, data);
    if (errors.length > 0)
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });

    const existingRecord = await Model.findOne(data);
    if (existingRecord) {
      return res.status(400).json({
        status: "error",
        message: `Record with these details already exists in ${modelName}`,
        data: null,
      });
    }

    const record = new Model(data);
    await record.save();

    res.json({
      status: "success",
      message: "Record created successfully",
      data: record,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message || "Internal server error",
      data: null,
    });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const Model = await createModel(req.params.model);
    const records = await Model.find();

    res.json({
      status: "success",
      message: `${records.length} records found`,
      data: records,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const Model = await createModel(req.params.model);
    const record = await Model.findById(req.params.id);

    if (!record)
      return res.status(404).json({
        status: "error",
        message: "Record not found",
        data: null,
      });

    res.json({
      status: "success",
      message: "Record found",
      data: record,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const modelName = req.params.model;
    const Model = await createModel(modelName);
    const data = req.body;

    for (const key in req.files || {}) {
      if (req.files[key][0]) {
        data[key] = `/uploads/${modelName}/${data.courseId || "general"}/${
          req.files[key][0].filename
        }`;
      }
    }

    const errors = await validateData(modelName, data);
    if (errors.length > 0)
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });

    const updatedRecord = await Model.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!updatedRecord)
      return res.status(404).json({
        status: "error",
        message: "Record not found",
        data: null,
      });

    res.json({
      status: "success",
      message: "Record updated successfully",
      data: updatedRecord,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const Model = await createModel(req.params.model);
    const deleted = await Model.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({
        status: "error",
        message: "Record not found",
        data: null,
      });

    res.json({
      status: "success",
      message: "Deleted successfully",
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};
