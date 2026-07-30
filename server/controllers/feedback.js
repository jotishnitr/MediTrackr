const Feedback = require("../models/Feedback");

const feedback = async (req, res) => {
  try {
    const { rating, category, message } = req.body;
    const feedback = await Feedback.create({
      userId: req.user.id,
      rating,
      category,
      message,
    });
    await feedback.save();
    res.status(200).json({
      success: true,
      message: "Feedback is stored successfully",
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Feedback is not stored successfully",
    });
    console.err(err.message);
  }
};

module.exports = feedback;
