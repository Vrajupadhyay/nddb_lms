const createModel = require("../models/record.model");

// This function fetches a record by ID and dynamically joins related records
exports.getRecordWithRelations = async (req, res) => {
  try {
    const { model, id } = req.params;
    const { userId } = req.query; // capture optional userId
    const Model = await createModel(model);

    const record = await Model.findById(id).lean();
    if (!record) {
      return res.status(404).json({
        status: "error",
        message: "Record not found",
        data: null,
      });
    }

    const FieldConfig = require("../models/fieldConfig.model");

    const relatedConfigs = await FieldConfig.find({
      "fields.ref": model,
    });

    for (const relatedConfig of relatedConfigs) {
      const relatedModelName = relatedConfig.model;
      const relatedModel = await createModel(relatedModelName);

      const refFields = relatedConfig.fields.filter((f) => f.ref === model);

      for (const refField of refFields) {
        let query = { [refField.name]: id };

        // ✅ If userId is present, limit to that user for related models that have userId
        if (userId && relatedConfig.fields.some((f) => f.name === "userId")) {
          query["userId"] = userId;
        }

        const relatedRecords = await relatedModel.find(query).lean();

        const key = relatedModelName.endsWith("s")
          ? relatedModelName
          : relatedModelName + "s";

        record[key] = relatedRecords;
      }
    }

    res.json({
      status: "success",
      message: "Record with relations found",
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