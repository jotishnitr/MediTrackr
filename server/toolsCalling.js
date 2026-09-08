const User = require('./models/User')
const HealthProfile = require('./models/HealthProfile')
const HealthLog = require('./models/HealthLog')
const HealthReport = require('./models/HealthReport')
const Medicine = require('./models/Medicine')
const Alert = require('./models/Alert')

const tools = {
    getUserProfile: async ({ userId }) => {
        const user = await User.findById(userId)
        return user
    },
    getHealthProfile: async ({ userId }) => {
        const healthProfile = await HealthProfile.findOne({ userId })
        return healthProfile
    },
    getHealthLog: async ({ userId }) => {
        const healthLog = await HealthLog.findOne({ userId })
        return healthLog
    },
    getHealthReport: async ({ userId }) => {
        const healthReport = await HealthReport.findOne({ userId })
        return healthReport
    },
    getMedicines: async ({ userId }) => {
        const medicines = await Medicine.find({ userId })
        return medicines
    },
    getAlerts: async ({ userId }) => {
        const alerts = await Alert.find({ userId })
        return alerts
    }
}

module.exports = tools