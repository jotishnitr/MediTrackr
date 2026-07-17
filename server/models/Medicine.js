const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },

  dosage: {
    type: Number,
    required: true,
  },

  unit: {
    type: String,
    enum: ["mg", "ml", "g"],
    required: true,
  },

  type: {
    type: String,
    enum: ["Oral Tablet", "Capsule", "Syrup", "Injection"],
    required: true,
  },

  time: {
    type: String,
    required: true,
  },

  instructions: {
    type: String,
    default: "",
  },

  status: {
    type: Boolean,
    default: false,
  },

  reminder: {
    type: Boolean,
    default: true,
  },

  takenDate: {
    type: Date,
    default: null,
  },
  history: [
    {
      date: {

        type: Date,
      },
      status: {
        type: Boolean,
      },
    },
  ],
});

module.exports = mongoose.model("Medicine", medicineSchema);
