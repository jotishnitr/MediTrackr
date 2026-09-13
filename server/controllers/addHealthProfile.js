const HealthProfile = require("../models/HealthProfile");
const User = require("../models/user");
const Notification = require("../models/Notification");
const {
    sendFamilyMemberAddedEmail,
    sendFamilyMemberRemovedEmail,
    sendFamilyMemberConfirmationEmail,
} = require("../utils/email");

const addHealthProfile = async (req, res) => {
    try {
        const {
            fullName,
            age,
            bloodType,
            height,
            weight,
            allergies,
            emergencyContact,
            familyMembersEmails,
        } = req.body;

        // Fetch current user and previously connected family members
        const currentUser = await User.findById(req.user.id).populate("familyMembersUserId", "email name");
        const existingFamilyEmails = (currentUser?.familyMembersUserId || [])
            .map((u) => (typeof u === "object" && u !== null ? u.email?.toLowerCase() : ""))
            .filter(Boolean);
        const existingFamilyUserIds = (currentUser?.familyMembersUserId || [])
            .map((u) => (typeof u === "object" && u !== null ? u._id.toString() : u.toString()))
            .filter(Boolean);

        // Process Family Members if emails array provided
        let familyMembersEmailsList = [];
        if (Array.isArray(familyMembersEmails)) {
            const cleanedEmails = familyMembersEmails
                .filter(Boolean)
                .map((email) => email.trim().toLowerCase())
                .filter((email) => email !== req.user?.email?.toLowerCase());

            let familyUserIds = [];
            let familyUsers = [];
            if (cleanedEmails.length > 0) {
                familyUsers = await User.find({
                    email: { $in: cleanedEmails },
                    _id: { $ne: req.user.id },
                }).select("_id email name");

                familyUserIds = familyUsers.map((u) => u._id);
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { familyMembersUserId: familyUserIds },
                { new: true }
            ).populate("familyMembersUserId", "email name");

            // Automatically link this user in the other users' records (Bidirectional linking)
            if (familyUserIds.length > 0) {
                await User.updateMany(
                    { _id: { $in: familyUserIds } },
                    { $addToSet: { familyMembersUserId: req.user.id } }
                );
            }

            // If any family user was removed, unlink from their record as well
            const currentFamilyIdStrings = familyUserIds.map((id) => id.toString());
            const removedFamilyUserIds = existingFamilyUserIds.filter(
                (id) => !currentFamilyIdStrings.includes(id)
            );
            if (removedFamilyUserIds.length > 0) {
                await User.updateMany(
                    { _id: { $in: removedFamilyUserIds } },
                    { $pull: { familyMembersUserId: req.user.id } }
                );
            }

            familyMembersEmailsList = (updatedUser?.familyMembersUserId || [])
                .map((u) => (typeof u === "object" && u !== null ? u.email : u))
                .filter(Boolean);

            // 1. Newly Added Family Emails
            const newlyAddedEmails = cleanedEmails.filter((email) => !existingFamilyEmails.includes(email));

            for (const email of newlyAddedEmails) {
                // Send notification email to the added family member
                sendFamilyMemberAddedEmail(
                    email,
                    currentUser?.name || fullName,
                    req.user?.email
                ).catch((err) => {
                    console.error(`[Family Added Email Error] Failed to send email to ${email}:`, err);
                });

                // Send confirmation email to the user who added them
                sendFamilyMemberConfirmationEmail(
                    req.user?.email,
                    currentUser?.name || fullName,
                    email,
                    "added"
                ).catch((err) => {
                    console.error(`[Family Confirmation Email Error] Failed to send confirmation to ${req.user?.email}:`, err);
                });

                // Store in-app notification if the family member has a registered account
                const matchedUser = familyUsers.find((u) => u.email?.toLowerCase() === email);
                if (matchedUser) {
                    try {
                        const familyNotification = new Notification({
                            userId: matchedUser._id,
                            title: "👨‍👩‍👧 Family Connection Added",
                            userName: req.user.id,
                            message: `${currentUser?.name || fullName || req.user?.email} added you as a family member on MediTrackr to help monitor medication schedules and safety alerts.`,
                            type: "alert",
                            isRead: false,
                        });
                        await familyNotification.save();
                    } catch (notifErr) {
                        console.error(`[Family Notification Error] Failed to save in-app notification for ${email}:`, notifErr);
                    }
                }
            }

            // 2. Removed Family Emails
            const removedEmails = existingFamilyEmails.filter((email) => !cleanedEmails.includes(email));

            for (const email of removedEmails) {
                // Send notification email to the removed family member
                sendFamilyMemberRemovedEmail(
                    email,
                    currentUser?.name || fullName,
                    req.user?.email
                ).catch((err) => {
                    console.error(`[Family Removed Email Error] Failed to send email to ${email}:`, err);
                });

                // Send confirmation email to the user who removed them
                sendFamilyMemberConfirmationEmail(
                    req.user?.email,
                    currentUser?.name || fullName,
                    email,
                    "removed"
                ).catch((err) => {
                    console.error(`[Family Confirmation Email Error] Failed to send removal confirmation to ${req.user?.email}:`, err);
                });

                // Store in-app notification for the disconnected user if registered
                try {
                    const removedUserObj = await User.findOne({ email });
                    if (removedUserObj) {
                        const removeNotif = new Notification({
                            userId: removedUserObj._id,
                            title: "ℹ️ Family Connection Removed",
                            userName: req.user.id,
                            message: `Your family connection with ${currentUser?.name || fullName || req.user?.email} on MediTrackr has been disconnected.`,
                            type: "alert",
                            isRead: false,
                        });
                        await removeNotif.save();
                    }
                } catch (notifErr) {
                    console.error(`[Family Notification Error] Failed to save removal notification for ${email}:`, notifErr);
                }
            }
        } else {
            familyMembersEmailsList = (currentUser?.familyMembersUserId || [])
                .map((u) => (typeof u === "object" && u !== null ? u.email : u))
                .filter(Boolean);
        }

        const existingProfile = await HealthProfile.findOne({ user: req.user.id });
        if (existingProfile) {
            existingProfile.fullName = fullName;
            existingProfile.age = age;
            existingProfile.bloodType = bloodType;
            existingProfile.height = height;
            existingProfile.weight = weight;
            existingProfile.allergies = allergies;
            existingProfile.emergencyContact = emergencyContact;
            await existingProfile.save();
            return res.status(200).json({
                success: true,
                profile: {
                    ...existingProfile.toObject(),
                    email: req.user?.email,
                    familyMembersEmails: familyMembersEmailsList,
                },
            });
        }

        const profile = await HealthProfile.create({
            user: req.user.id,
            fullName,
            age,
            bloodType,
            height,
            weight,
            allergies,
            emergencyContact,
        });
        res.status(201).json({
            success: true,
            profile: {
                ...profile.toObject(),
                email: req.user?.email,
                familyMembersEmails: familyMembersEmailsList,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
module.exports = addHealthProfile;
