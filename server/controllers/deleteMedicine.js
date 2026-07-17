const Medicine = require("../models/Medicine.js");
const deleteMedicine = async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findOneAndDelete({
      _id: req.query.id,
      userId: req.user.id
    });
    if (!deletedMedicine) {
      res.status(404).json({
        message: "Medicine not found",
      });
    }
    res.status(200).json({
      success: true,
      id: req.query.id,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = deleteMedicine;
