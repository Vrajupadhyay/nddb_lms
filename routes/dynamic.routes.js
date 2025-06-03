// routes/dynamic.routes.js
const express = require("express");
const router = express.Router();
const dynamicController = require("../controllers/dynamic.controller");
const uploadMiddleware = require("../services/fileService");
const auth = require("../auth/auth.middleware");

router.post(
  "/:model",
  auth.verifyToken,
  auth.requireRole("admin"),
  (req, res, next) => {
    const model = req.params.model;
    const upload = uploadMiddleware(model).fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "contentFile", maxCount: 1 },
    ]);
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  dynamicController.createRecord
);

router.get("/:model", dynamicController.getRecords);
router.get("/:model/:id", dynamicController.getRecordById);
router.put(
  "/:model/:id",
  auth.verifyToken,
  auth.requireRole("admin"),
  (req, res, next) => {
    const model = req.params.model;
    const upload = uploadMiddleware(model).fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "contentFile", maxCount: 1 },
    ]);
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  dynamicController.updateRecord
);

router.delete(
  "/:model/:id",
  auth.verifyToken,
  auth.requireRole("admin"),
  dynamicController.deleteRecord
);

module.exports = router;
