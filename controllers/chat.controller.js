const createModel = require("../models/record.model");

const CHAT_MODEL = "courseChats";
const USER_MODEL = "users"; // Adjust if your users model has a different name

exports.getCourseChat = async (req, res) => {
    try {
        const ChatModel = await createModel(CHAT_MODEL);
        const UserModel = await createModel(USER_MODEL);
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

        // Use aggregation to join with users collection
        const chats = await ChatModel.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: USER_MODEL,
                    localField: "senderId",
                    foreignField: "_id",
                    as: "senderInfo"
                }
            },
            { $unwind: { path: "$senderInfo", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    senderName: "$senderInfo.name" // Adjust if your user name field is different
                }
            },
            { $sort: { timestamp: 1 } },
            {
                $project: {
                    senderInfo: 0 // remove senderInfo array from result
                }
            }
        ]);

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
