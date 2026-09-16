export function getMedicineStatus(medicine) {

    if (medicine.status) {
        return "TAKEN";
    }

    const now = new Date();

    const [hours, minutes] =
        medicine.time.split(":");

    const medicineTime = new Date();

    medicineTime.setHours(Number(hours));
    medicineTime.setMinutes(Number(minutes));
    medicineTime.setSeconds(0);

    if (now > medicineTime) {
        return "MISSED";
    }

    return "PENDING";
}

export function formatDaysLabel(days) {
    if (!days || !Array.isArray(days) || days.length === 0 || days.length === 7) return "Daily";
    if (days.length === 5 && !days.includes("Saturday") && !days.includes("Sunday")) return "Weekdays (Mon-Fri)";
    if (days.length === 2 && days.includes("Saturday") && days.includes("Sunday")) return "Weekends (Sat-Sun)";
    return days.map((d) => d.slice(0, 3)).join(", ");
}

export function isMedicineScheduledToday(medicine, dayName = new Date().toLocaleDateString("en-US", { weekday: "long" })) {
    if (!medicine || !medicine.days || !Array.isArray(medicine.days) || medicine.days.length === 0) return true;
    return medicine.days.includes(dayName) || medicine.days.includes(dayName.slice(0, 3));
}