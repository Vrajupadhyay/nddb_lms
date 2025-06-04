const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

router.get("/course", chatController.getCourseChat);

module.exports = router;
