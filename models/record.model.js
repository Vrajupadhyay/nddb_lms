// models/record.model.js
const mongoose = require("mongoose");
const FieldConfig = require("./fieldConfig.model");

const createdModels = {};

// Utility to convert field config to mongoose schema
function createSchemaFromFields(fields) {
  const schemaDefinition = {};

  fields.forEach((field) => {
    let type;
    switch (field.type) {
      case "string":
      case "richtext":
        type = String;
        break;
      case "number":
        type = Number;
        break;
      case "boolean":
        type = Boolean;
        break;
      case "file":
        type = String; // File path
        break;
      case "select":
        type = String;
        break;
      case "reference":
        type = mongoose.Schema.Types.ObjectId;
        break;
      default:
        type = String;
    }

    const fieldOptions = {
      type,
      required: field.required || false
    };

    if (field.default !== undefined) fieldOptions.default = field.default;
    if (field.ref) fieldOptions.ref = field.ref;

    schemaDefinition[field.name] = fieldOptions;

  });

  return new mongoose.Schema(schemaDefinition, { timestamps: true });
}

async function createModel(modelName) {
  if (createdModels[modelName]) return createdModels[modelName];

  const config = await FieldConfig.findOne({ model: modelName });
  if (!config) throw new Error(`No field config found for model ${modelName}`);

  const schema = createSchemaFromFields(config.fields);
  const model = mongoose.model(modelName, schema);

  createdModels[modelName] = model;
  return model;
}

module.exports = createModel;
