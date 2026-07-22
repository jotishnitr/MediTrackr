const Medicine = require("../models/Medicine");

const getMedicine = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current date normalized to start of today in local/UTC server time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update medicines where status is true and takenDate was before today
    await Medicine.updateMany(
      {
        userId,
        status: true,
        takenDate: { $lt: today }
      },
      {
        $set: {
          status: false,
          takenDate: null
        }
      }
    );

    const medicines = await Medicine.find({
      userId
    });

    res.status(200).json(medicines);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = getMedicine;
