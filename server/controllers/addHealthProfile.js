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

        // Fetch current user with connected and pending family members
        const currentUser = await User.findById(req.user.id)
            .populate("familyMembersUserId", "email name")
            .populate("pendingFamilyMembersUserId", "email name");

        const existingConnectedEmails = (currentUser?.familyMembersUserId || [])
            .map((u) => (typeof u === "object" && u !== null ? u.email?.toLowerCase() : ""))
            .filter(Boolean);

        const existingPendingUserEmails = (currentUser?.pendingFamilyMembersUserId || [])
            .map((u) => (typeof u === "object" && u !== null ? u.email?.toLowerCase() : ""))
            .filter(Boolean);

        const existingPendingRawEmails = (currentUser?.pendingFamilyEmails || [])
            .map((e) => e?.toLowerCase())
            .filter(Boolean);

        const allExistingEmails = Array.from(
            new Set([...existingConnectedEmails, ...existingPendingUserEmails, ...existingPendingRawEmails])
        );

        let allFamilyMembers = [];
        let familyMembersEmailsList = [];

        if (Array.isArray(familyMembersEmails)) {
            const cleanedEmails = familyMembersEmails
                .filter(Boolean)
                .map((email) => email.trim().toLowerCase())
                .filter((email) => email !== req.user?.email?.toLowerCase());

            // 1. Find newly added emails vs removed emails
            const newlyAddedEmails = cleanedEmails.filter((email) => !allExistingEmails.includes(email));
            const removedEmails = allExistingEmails.filter((email) => !cleanedEmails.includes(email));

            // Retain currently connected users who are NOT removed
            let remainingConnectedUserIds = (currentUser?.familyMembersUserId || [])
                .filter((u) => {
                    const em = typeof u === "object" && u !== null ? u.email?.toLowerCase() : "";
                    return em && cleanedEmails.includes(em);
                })
                .map((u) => u._id);

            // Retain currently pending users who are NOT removed
            let remainingPendingUserIds = (currentUser?.pendingFamilyMembersUserId || [])
                .filter((u) => {
                    const em = typeof u === "object" && u !== null ? u.email?.toLowerCase() : "";
                    return em && cleanedEmails.includes(em);
                })
                .map((u) => u._id);

            // Retain currently pending raw emails who are NOT removed
            let remainingPendingRawEmails = existingPendingRawEmails.filter(
                (em) => cleanedEmails.includes(em)
            );

            // 2. Process Newly Added Family Emails -> Send Connection Requests
            for (const email of newlyAddedEmails) {
                const matchedUser = await User.findOne({
                    email,
                    _id: { $ne: req.user.id },
                }).select("_id email name");

                if (matchedUser) {
                    if (!remainingPendingUserIds.some((id) => id.toString() === matchedUser._id.toString())) {
                        remainingPendingUserIds.push(matchedUser._id);
                    }

                    // Create in-app connection notification for the recipient
                    try {
                        const familyNotification = new Notification({
                            userId: matchedUser._id,
                            title: "👨‍👩‍👧 Family Connection Request",
                            userName: req.user.id,
                            message: `${currentUser?.name || fullName || req.user?.email} sent you a family connection request on MediTrackr. Accept to link health tracking and safety alerts.`,
                            type: "connection",
                            connectionStatus: "pending",
                            isRead: false,
                        });
                        await familyNotification.save();
                    } catch (notifErr) {
                        console.error(`[Family Notification Error] Failed to save connection request notification for ${email}:`, notifErr);
                    }
                } else {
                    if (!remainingPendingRawEmails.includes(email)) {
                        remainingPendingRawEmails.push(email);
                    }
                }

                // Send notification email to the added family member
                sendFamilyMemberAddedEmail(
                    email,
                    currentUser?.name || fullName,
                    req.user?.email
                ).catch((err) => {
                    console.error(`[Family Added Email Error] Failed to send email to ${email}:`, err);
                });

                // Send confirmation email to the user who requested them
                sendFamilyMemberConfirmationEmail(
                    req.user?.email,
                    currentUser?.name || fullName,
                    email,
                    "added"
                ).catch((err) => {
                    console.error(`[Family Confirmation Email Error] Failed to send confirmation to ${req.user?.email}:`, err);
                });
            }

            // 3. Process Removed Family Emails -> Disconnect & Cancel Pending
            for (const email of removedEmails) {
                try {
                    const removedUser = await User.findOne({ email });
                    if (removedUser) {
                        // Unlink from other user's record
                        await User.findByIdAndUpdate(removedUser._id, {
                            $pull: {
                                familyMembersUserId: req.user.id,
                                pendingFamilyMembersUserId: req.user.id,
                                pendingFamilyEmails: req.user?.email?.toLowerCase(),
                            },
                        });

                        // Clean up any unread connection notifications sent to them
                        await Notification.updateMany(
                            {
                                userId: removedUser._id,
                                userName: req.user.id,
                                type: "connection",
                                isRead: false,
                            },
                            { $set: { isRead: true, connectionStatus: "rejected" } }
                        );

                        // Send removal notification
                        const removeNotif = new Notification({
                            userId: removedUser._id,
                            title: "ℹ️ Family Connection Removed",
                            userName: req.user.id,
                            message: `Your family connection with ${currentUser?.name || fullName || req.user?.email} on MediTrackr has been disconnected.`,
                            type: "alert",
                            isRead: false,
                        });
                        await removeNotif.save();
                    }
                } catch (remErr) {
                    console.error(`[Family Removal Error] Error removing connection with ${email}:`, remErr);
                }

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
            }

            // Update Current User
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                {
                    familyMembersUserId: remainingConnectedUserIds,
                    pendingFamilyMembersUserId: remainingPendingUserIds,
                    pendingFamilyEmails: remainingPendingRawEmails,
                },
                { new: true }
            )
                .populate("familyMembersUserId", "email name")
                .populate("pendingFamilyMembersUserId", "email name");

            const connectedList = (updatedUser?.familyMembersUserId || []).map((u) => ({
                email: typeof u === "object" && u !== null ? u.email : "",
                name: typeof u === "object" && u !== null ? u.name : "",
                status: "connected",
            })).filter((m) => Boolean(m.email));

            const pendingUserList = (updatedUser?.pendingFamilyMembersUserId || []).map((u) => ({
                email: typeof u === "object" && u !== null ? u.email : "",
                name: typeof u === "object" && u !== null ? u.name : "",
                status: "pending",
            })).filter((m) => Boolean(m.email));

            const pendingRawList = (updatedUser?.pendingFamilyEmails || []).map((email) => ({
                email,
                name: "",
                status: "pending",
            }));

            allFamilyMembers = [...connectedList, ...pendingUserList, ...pendingRawList];
            familyMembersEmailsList = allFamilyMembers.map((m) => m.email);
        } else {
            const connectedList = (currentUser?.familyMembersUserId || []).map((u) => ({
                email: typeof u === "object" && u !== null ? u.email : "",
                name: typeof u === "object" && u !== null ? u.name : "",
                status: "connected",
            })).filter((m) => Boolean(m.email));

            const pendingUserList = (currentUser?.pendingFamilyMembersUserId || []).map((u) => ({
                email: typeof u === "object" && u !== null ? u.email : "",
                name: typeof u === "object" && u !== null ? u.name : "",
                status: "pending",
            })).filter((m) => Boolean(m.email));

            const pendingRawList = (currentUser?.pendingFamilyEmails || []).map((email) => ({
                email,
                name: "",
                status: "pending",
            }));

            allFamilyMembers = [...connectedList, ...pendingUserList, ...pendingRawList];
            familyMembersEmailsList = allFamilyMembers.map((m) => m.email);
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
                    familyMembers: allFamilyMembers,
                    familyMembersEmails: familyMembersEmailsList,
                    connectedFamilyEmails: allFamilyMembers.filter((m) => m.status === "connected").map((m) => m.email),
                    pendingFamilyEmails: allFamilyMembers.filter((m) => m.status === "pending").map((m) => m.email),
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
                familyMembers: allFamilyMembers,
                familyMembersEmails: familyMembersEmailsList,
                connectedFamilyEmails: allFamilyMembers.filter((m) => m.status === "connected").map((m) => m.email),
                pendingFamilyEmails: allFamilyMembers.filter((m) => m.status === "pending").map((m) => m.email),
            },
        });
    } catch (err) {
        console.error("Error in addHealthProfile:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

module.exports = addHealthProfile;
