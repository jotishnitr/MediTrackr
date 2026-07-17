const Medicine = require("../models/Medicine.js");
const addMedicine = async (req, res) => {
  try {
    const {
      name,
      dosage,
      unit,
      frequency,
      time,
      reminder,
      type,
      instructions,
    } = req.body;
    const medicine = await Medicine.create({
      userId: req.user.id,
      name,
      dosage,
      unit,
      type,
      time,
      instructions,
    });
    await medicine.save();
    res.status(201).json({
      sucess: true,
      medicine,
    });
    console.log(medicine);
  } catch (err) {
    res.status(404).json(err);
  }
};

module.exports = addMedicine;
