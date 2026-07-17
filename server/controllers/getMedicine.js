const Medicine = require("../models/Medicine");

const getMedicine = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      userId: req.user.id
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
