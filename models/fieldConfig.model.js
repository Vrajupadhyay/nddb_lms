const mongoose = require('mongoose');
const fieldConfigSchema = new mongoose.Schema({
  model: String,
  fields: Array,
});
module.exports = mongoose.model('FieldConfig', fieldConfigSchema);
