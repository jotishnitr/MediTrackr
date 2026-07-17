const HealthLog = require("../models/HealthLog");

const healthLog = async (req, res) => {
  try {
    const { date, bloodPressure, sleepHours, weight, symptoms, notes } =
      req.body;

    const existingLog = await HealthLog.findOne({
      date,
      userId: req.user.id,
    });

    if (existingLog) {
      existingLog.bloodPressure = bloodPressure;
      existingLog.sleepHours = sleepHours;
      existingLog.weight = weight;
      existingLog.symptoms = symptoms;
      existingLog.notes = notes;

      await existingLog.save();

      return res.status(200).json(existingLog);
    }

    const newLog = await HealthLog.create({
      date,
      userId: req.user.id,
      bloodPressure,
      sleepHours,
      weight,
      symptoms,
      notes,
    });

    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = healthLog;
