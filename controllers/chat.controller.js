const createModel = require("../models/record.model");

// Assuming your chat model name is something like "courseChats"
const CHAT_MODEL = "courseChats";

exports.getCourseChat = async (req, res) => {
  try {
    const Model = await createModel(CHAT_MODEL);
    const { courseId, senderRole, senderId } = req.query;

    if (!courseId) {
      return res.status(400).json({
        status: "error",
        message: "Missing courseId in query",
      });
    }

    const filter = { courseId };
    if (senderRole) filter.senderRole = senderRole;
    if (senderId) filter.senderId = senderId;

    const chats = await Model.find(filter).sort({ timestamp: 1 });

    res.json({
      status: "success",
      message: `${chats.length} messages found`,
      data: chats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch chat",
      data: null,
    });
  }
};
