// routes/dynamic.routes.js
const express = require("express");
const router = express.Router();
const dynamicController = require("../controllers/dynamic.controller");
const uploadMiddleware = require("../services/fileService");
const auth = require("../auth/auth.middleware");

// Config: Define role requirements per model and method
const accessControl = {
  users: {
    GET: "admin",
    POST: "admin",
    DELETE: "admin",
  },
  courses: {
    POST: "admin",
    DELETE: "admin",
    PUT: "admin",
    GET: "user", // for enrolled users (or public)
  },
  enrollments: {
    POST: "user",
    GET: "user",
  },
  modules: {
    POST: "admin",
    DELETE: "admin",
    PUT: "admin",
    GET: "user", // for enrolled users (or public)
  },
};

function applyAccessControl(model, method) {
  return [
    auth.verifyToken,
    (req, res, next) => {
      const roleNeeded = accessControl[model]?.[method];
      if (!roleNeeded) return next(); // public
      return auth.requireRole(roleNeeded)(req, res, next);
    },
  ];
}

function applyAccessControlMiddleware(method) {
  return [
    (req, res, next) => {
      const model = req.params.model;
      const middleware = applyAccessControl(model, method);
      if (!middleware.length) return next();
      middleware[0](req, res, () => middleware[1](req, res, next));
    },
  ];
}


router.post(
  "/:model",
  applyAccessControlMiddleware("POST"),
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
  applyAccessControlMiddleware("PUT"),
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
  applyAccessControlMiddleware("DELETE"),
  auth.requireRole("admin"),
  dynamicController.deleteRecord
);

module.exports = router;
