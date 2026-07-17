require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetchFDA = require("./routes/fetchFDA");
const addMedicine = require("./routes/addMedicine");
const getMedicine = require("./routes/getMedicine");
const statusMedicine = require("./routes/statusMedicine");
const deleteMedicine = require("./routes/deleteMedicine");
const healthLog = require("./routes/healthLog");
const getHealthLog = require("./routes/getHealthLog");
const weeklyAdherence = require("./routes/weeklyAdherence");
const reminderMedicine = require("./routes/reminderMedicine");
const setBrowserAlerts = require("./routes/setBrowserAlerts");
const setNotificationSound = require("./routes/setNotificationSound");
const getSettings = require("./routes/getSettings");
const subscribe = require("./routes/subscribe");
const login = require("./routes/login");
const register = require("./routes/register");
const cookieParser = require("cookie-parser");
const getCurrentUser = require("./routes/getCurrentUser");
const addHealthProfile = require("./routes/addHealthProfile");
const getHealthProfile = require("./routes/getHealthProfile");
const googleLogin = require("./routes/googleLogin");
require("./utils/reminderScheduler");
require("./utils/resetMedicineStatus");
const connectDB = require("./config/db.js");

const app = express();
connectDB();

const corsOption = {
  origin: "http://localhost:5173",
  credentials: true,
}

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());
app.use("/", fetchFDA);
app.use("/", addMedicine);
app.use("/", getMedicine);
app.use("/", statusMedicine);
app.use("/", deleteMedicine);
app.use("/", healthLog);
app.use("/", getHealthLog);
app.use("/", weeklyAdherence);
app.use("/", reminderMedicine);
app.use("/", setBrowserAlerts);
app.use("/", setNotificationSound);
app.use("/", getSettings);
app.use("/", subscribe);
app.use("/", login);
app.use("/", register);
app.use("/", getCurrentUser);
app.use("/", addHealthProfile);
app.use("/", getHealthProfile);
app.use("/", googleLogin);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
