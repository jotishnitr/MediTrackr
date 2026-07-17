const cron = require("node-cron");
const Medicine = require("../models/Medicine");

// Runs every day at 12:00 AM (midnight)
cron.schedule("0 0 * * *", async () => {
    try {
        console.log("Resetting medicine status...");

        const result = await Medicine.updateMany(
            { status: true },
            {
                $set: {
                    status: false,
                    takenDate: null,
                },
            }
        );

        console.log(
            `Medicine status reset completed. Updated ${result.modifiedCount} medicines.`
        );
    } catch (err) {
        console.error("Medicine reset error:", err);
    }
});

module.exports = {};