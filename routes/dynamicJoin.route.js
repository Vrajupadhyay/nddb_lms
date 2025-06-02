const express = require("express");
const router = express.Router();
const dynamicJoinController = require("../controllers/dynamicJoin.controller");

// GET /api/join/:model/:id  => get record with related data dynamically
router.get("/:model/:id", dynamicJoinController.getRecordWithRelations);

module.exports = router;
