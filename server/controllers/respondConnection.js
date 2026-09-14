const Notification = require("../models/Notification");
const User = require("../models/user");
const {
    sendFamilyConnectionAcceptedEmail,
    sendFamilyConnectionDeclinedEmail,
} = require("../utils/email");

const respondConnection = async (req, res) => {
    try {
        const { notificationId, action } = req.body;
        const currentUserId = req.user.id;

        if (!notificationId || !["accept", "reject"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Valid notificationId and action ('accept' or 'reject') are required",
            });
        }

        const notification = await Notification.findOne({
            _id: notificationId,
            userId: currentUserId,
            type: "connection",
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Connection notification not found or unauthorized",
            });
        }

        const currentUser = await User.findById(currentUserId);
        const requesterId = notification.userName;
        const requester = requesterId ? await User.findById(requesterId) : null;

        if (action === "accept") {
            if (requester) {
                // Add to both users' familyMembersUserId bidirectionally
                await User.findByIdAndUpdate(requester._id, {
                    $addToSet: { familyMembersUserId: currentUserId },
                    $pull: {
                        pendingFamilyMembersUserId: currentUserId,
                        pendingFamilyEmails: currentUser?.email?.toLowerCase(),
                    },
                });

                await User.findByIdAndUpdate(currentUserId, {
                    $addToSet: { familyMembersUserId: requester._id },
                    $pull: {
                        pendingFamilyMembersUserId: requester._id,
                        pendingFamilyEmails: requester?.email?.toLowerCase(),
                    },
                });

                // Send an in-app confirmation notification to the requester
                try {
                    const acceptNotif = new Notification({
                        userId: requester._id,
                        title: "✅ Family Connection Accepted",
                        userName: currentUserId,
                        message: `${currentUser?.name || currentUser?.email} accepted your family connection request. You are now connected on MediTrackr.`,
                        type: "alert",
                        isRead: false,
                    });
                    await acceptNotif.save();
                } catch (notifErr) {
                    console.error("Failed to send acceptance notification to requester:", notifErr);
                }

                // Send email of acceptance to BOTH users
                sendFamilyConnectionAcceptedEmail(
                    requester.email,
                    requester.name,
                    currentUser?.email,
                    currentUser?.name,
                    "requester"
                ).catch((err) => {
                    console.error(`[Acceptance Email Error] Failed to send to requester ${requester.email}:`, err);
                });

                sendFamilyConnectionAcceptedEmail(
                    currentUser?.email,
                    currentUser?.name,
                    requester.email,
                    requester.name,
                    "acceptor"
                ).catch((err) => {
                    console.error(`[Acceptance Email Error] Failed to send to acceptor ${currentUser?.email}:`, err);
                });
            }

            notification.isRead = true;
            notification.connectionStatus = "accepted";
            await notification.save();

            return res.status(200).json({
                success: true,
                message: "Family connection request accepted successfully",
                status: "accepted",
            });
        } else {
            // Action is reject
            if (requester) {
                // Clean up pending entries
                await User.findByIdAndUpdate(requester._id, {
                    $pull: {
                        pendingFamilyMembersUserId: currentUserId,
                        pendingFamilyEmails: currentUser?.email?.toLowerCase(),
                    },
                });

                await User.findByIdAndUpdate(currentUserId, {
                    $pull: {
                        pendingFamilyMembersUserId: requester._id,
                        pendingFamilyEmails: requester?.email?.toLowerCase(),
                    },
                });

                // Send decline in-app notice to requester
                try {
                    const declineNotif = new Notification({
                        userId: requester._id,
                        title: "ℹ️ Family Connection Declined",
                        userName: currentUserId,
                        message: `${currentUser?.name || currentUser?.email} declined your family connection request.`,
                        type: "alert",
                        isRead: false,
                    });
                    await declineNotif.save();
                } catch (notifErr) {
                    console.error("Failed to send decline notification to requester:", notifErr);
                }

                // Send email of declination to BOTH users
                sendFamilyConnectionDeclinedEmail(
                    requester.email,
                    requester.name,
                    currentUser?.email,
                    currentUser?.name,
                    "requester"
                ).catch((err) => {
                    console.error(`[Decline Email Error] Failed to send to requester ${requester.email}:`, err);
                });

                sendFamilyConnectionDeclinedEmail(
                    currentUser?.email,
                    currentUser?.name,
                    requester.email,
                    requester.name,
                    "rejector"
                ).catch((err) => {
                    console.error(`[Decline Email Error] Failed to send to rejector ${currentUser?.email}:`, err);
                });
            }

            notification.isRead = true;
            notification.connectionStatus = "rejected";
            await notification.save();

            return res.status(200).json({
                success: true,
                message: "Family connection request declined",
                status: "rejected",
            });
        }
    } catch (err) {
        console.error("Error responding to connection request:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to respond to connection request",
            error: err.message,
        });
    }
};

module.exports = respondConnection;
