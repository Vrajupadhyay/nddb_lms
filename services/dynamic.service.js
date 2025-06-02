const getModel = require('../models/dynamicModel');
const { validateData } = require('../utils/validator');

const createDocument = async (collectionName, configFields, data) => {
  const errors = validateData(configFields, data);
  if (errors.length > 0) {
    throw { status: 400, errors };
  }

  const Model = getModel(collectionName);
  const document = new Model(data);
  return await document.save();
};

const getDocuments = async (collectionName) => {
  const Model = getModel(collectionName);
  return await Model.find();
};

const getDocumentById = async (collectionName, id) => {
  const Model = getModel(collectionName);
  return await Model.findById(id);
};

const updateDocument = async (collectionName, id, configFields, data) => {
  const errors = validateData(configFields, data);
  if (errors.length > 0) {
    throw { status: 400, errors };
  }

  const Model = getModel(collectionName);
  return await Model.findByIdAndUpdate(id, data, { new: true });
};

const deleteDocument = async (collectionName, id) => {
  const Model = getModel(collectionName);
  return await Model.findByIdAndDelete(id);
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};
