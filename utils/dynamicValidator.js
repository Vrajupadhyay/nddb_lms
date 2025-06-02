const FieldConfig = require('../models/fieldConfig.model');

async function validateData(modelName, data) {
  const config = await FieldConfig.findOne({ model: modelName });
  if (!config) throw new Error(`No config found for model ${modelName}`);

  const errors = [];

  config.fields.forEach(field => {
    const fieldName = field.name; // 👈 Corrected from field.key to field.name
    const value = data[fieldName];

    // Required check
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName} is required`);
    }

    // Select options check
    if (field.type === 'select' && field.options && !field.options.includes(value)) {
      errors.push(`${fieldName} must be one of: ${field.options.join(', ')}`);
    }

    // Add more validations if needed
  });

  return errors;
}

module.exports = validateData;
