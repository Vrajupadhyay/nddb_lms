const createModel = require("../models/record.model");

// This function fetches a record by ID and dynamically joins related records
exports.getRecordWithRelations = async (req, res) => {
  try {
    const { model, id } = req.params;
    const Model = await createModel(model);

    // First, get the main record
    const record = await Model.findById(id).lean();
    if (!record) return res.status(404).json({ status: "error", message: "Record not found", data: null });

    // Find related models dynamically by checking all models that have references to this model
    // This assumes you have 'FieldConfig' collection where you can check for fields referencing this model

    const FieldConfig = require("../models/fieldConfig.model");

    // Find all field configs where some field references this model (reverse lookup)
    const relatedConfigs = await FieldConfig.find({
      "fields.ref": model,
    });

    // For each related model, find records referencing this record's _id
    for (const relatedConfig of relatedConfigs) {
      const relatedModelName = relatedConfig.model;
      const relatedModel = await createModel(relatedModelName);

      // Find fields in related model that reference this model
      const refFields = relatedConfig.fields.filter(
        (f) => f.ref === model
      );

      for (const refField of refFields) {
        const relatedRecords = await relatedModel.find({
          [refField.name]: id,
        }).lean();

        // Add the related records to the original record under a pluralized key
        // e.g. for relatedModelName = 'module' => key = 'modules'
        const key = relatedModelName.endsWith('s') ? relatedModelName : relatedModelName + 's';
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
    res.status(500).json({ status: "error", message: "Internal server error", data: null });
  }
};
