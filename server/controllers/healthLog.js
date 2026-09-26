const HealthLog = require("../models/HealthLog");

const healthLog = async (req, res) => {
  try {
    const {
      date,
      bloodPressure,
      sleepHours,
      weight,
      symptoms,
      notes,
      waterIntake,
      heartRate,
      bodyTemperature,
      bloodSugar,
      bloodSugarContext,
      mood,
      stressLevel,
      energyLevel,
      painLevel,
      activityLevel,
      lifestyleTags,
    } = req.body;

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
      existingLog.waterIntake = waterIntake !== undefined ? waterIntake : existingLog.waterIntake;
      existingLog.heartRate = heartRate !== undefined ? heartRate : existingLog.heartRate;
      existingLog.bodyTemperature = bodyTemperature !== undefined ? bodyTemperature : existingLog.bodyTemperature;
      existingLog.bloodSugar = bloodSugar !== undefined ? bloodSugar : existingLog.bloodSugar;
      existingLog.bloodSugarContext = bloodSugarContext !== undefined ? bloodSugarContext : existingLog.bloodSugarContext;
      existingLog.mood = mood !== undefined ? mood : existingLog.mood;
      existingLog.stressLevel = stressLevel !== undefined ? stressLevel : existingLog.stressLevel;
      existingLog.energyLevel = energyLevel !== undefined ? energyLevel : existingLog.energyLevel;
      existingLog.painLevel = painLevel !== undefined ? painLevel : existingLog.painLevel;
      existingLog.activityLevel = activityLevel !== undefined ? activityLevel : existingLog.activityLevel;
      existingLog.lifestyleTags = lifestyleTags !== undefined ? lifestyleTags : existingLog.lifestyleTags;

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
      waterIntake: waterIntake || 0,
      heartRate: heartRate || null,
      bodyTemperature: bodyTemperature || null,
      bloodSugar: bloodSugar || null,
      bloodSugarContext: bloodSugarContext || "",
      mood: mood || "",
      stressLevel: stressLevel || null,
      energyLevel: energyLevel || "",
      painLevel: painLevel || 0,
      activityLevel: activityLevel || "",
      lifestyleTags: lifestyleTags || [],
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
