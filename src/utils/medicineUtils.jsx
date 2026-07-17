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