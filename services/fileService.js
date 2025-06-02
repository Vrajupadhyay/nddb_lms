// services/fileService.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const createStorage = (modelName) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const modelId = req.body.courseId || req.body._id || 'general';
      const dir = path.join(__dirname, '..', 'uploads', modelName, modelId.toString());
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

const uploadMiddleware = (modelName) => multer({ storage: createStorage(modelName) });

module.exports = uploadMiddleware;
