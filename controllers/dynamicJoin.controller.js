const createModel = require("../models/record.model");
const FieldConfig = require("../models/fieldConfig.model");

// This function fetches a record by ID and dynamically joins related records
exports.getRecordWithRelations = async (req, res) => {
  try {
    const { model, id } = req.params;
    const { userId } = req.query; // capture optional userId
    const Model = await createModel(model);

    const record = await Model.findById(id).lean();
    if (!record) {
      return res.status(404).json({
        status: "error",
        message: "Record not found",
        data: null,
      });
    }

    const FieldConfig = require("../models/fieldConfig.model");

    const relatedConfigs = await FieldConfig.find({
      "fields.ref": model,
    });

    for (const relatedConfig of relatedConfigs) {
      const relatedModelName = relatedConfig.model;
      const relatedModel = await createModel(relatedModelName);

      const refFields = relatedConfig.fields.filter((f) => f.ref === model);

      for (const refField of refFields) {
        let query = { [refField.name]: id };

        // ✅ If userId is present, limit to that user for related models that have userId
        if (userId && relatedConfig.fields.some((f) => f.name === "userId")) {
          query["userId"] = userId;
        }

        const relatedRecords = await relatedModel.find(query).lean();

        const key = relatedModelName.endsWith("s")
          ? relatedModelName
          : relatedModelName + "s";

        record[key] = relatedRecords;
      }
    }

    res.json({
      status: "success",
      message: "Record with relations found",
      data: record,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

exports.getUserWithFullRelations = async (req, res) => {
  try {
    const userId = req.params.id;
    const User = await createModel("users");

    // Get all models in the system
    const allFieldConfigs = await FieldConfig.find({});
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // For each model, check if it has a field referencing users
    for (const config of allFieldConfigs) {
      const relatedModelName = config.model;
      if (relatedModelName === "users") continue; // skip self

      const relatedModel = await createModel(relatedModelName);
      const userRefFields = config.fields.filter(f => f.ref === "users");

      for (const refField of userRefFields) {
        const query = { [refField.name]: userId };
        const relatedRecords = await relatedModel.find(query).lean();

        const key = relatedModelName.endsWith("s")
          ? relatedModelName
          : relatedModelName + "s";

        user[key] = relatedRecords;
      }
    }

    // Fetch course details for each enrollment and progress, with modules, etc.
    const Course = await createModel("courses");
    const Module = await createModel("modules");

    // Helper to get course tree
    async function getCourseTree(courseId) {
      const course = await Course.findById(courseId).lean();
      if (!course) return null;

      // Get modules for this course
      const modules = await Module.find({ courseId: course._id }).lean();

      // Get enrollments for this course and user
      const enrollments = (user.enrollments || []).filter(e => e.courseId.toString() === course._id.toString());

      // Get progresses for this course and user
      const progresses = (user.progress || []).filter(p => p.courseId.toString() === course._id.toString());

      return {
        ...course,
        modules,
        enrollments,
        progresses,
      };
    }

    // Collect all unique courseIds from enrollments and progress
    const courseIds = new Set([
      ...(user.enrollments || []).map(e => e.courseId.toString()),
      ...(user.progress || []).map(p => p.courseId.toString()),
    ]);

    // Build the course tree for each courseId
    user.courses = [];
    for (const courseId of courseIds) {
      const courseTree = await getCourseTree(courseId);
      if (courseTree) user.courses.push(courseTree);
    }

    res.status(200).json({
      status: "success",
      message: "User data with full relations and course tree",
      data: user,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};
