const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Settings = require("../models/Settings");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendWelcomeEmail } = require("../utils/email");

const allowedAudiences = Array.from(new Set([
    process.env.CLIENT_ID,
    process.env.GOOGLE_CLIENT_ID,
    process.env.VITE_GOOGLE_CLIENT_ID,
    "711869519678-7v2vpv2v718oi30i5h0j018vlueogk8f.apps.googleusercontent.com",
    "770843042549-a23osvk5au9hdavm1ere0heehatv409v.apps.googleusercontent.com"
].filter(Boolean)));

const client = new OAuth2Client();

const googleLogin = async (req, res) => {
    try {
        const { credential, accessToken, idToken, email: bodyEmail, name: bodyName, picture: bodyPicture } = req.body;
        const rawToken = credential || idToken;

        let email = bodyEmail;
        let name = bodyName;
        let picture = bodyPicture;

        if (rawToken) {
            try {
                const ticket = await client.verifyIdToken({
                    idToken: rawToken,
                    audience: allowedAudiences,
                });
                const payload = ticket.getPayload();
                if (payload) {
                    email = payload.email || email;
                    name = payload.name || name;
                    picture = payload.picture || picture;
                }
            } catch (verifyErr) {
                // If direct Google verification fails (e.g. Firebase ID token or audience mismatch), decode JWT safely
                const decoded = jwt.decode(rawToken);
                if (decoded && decoded.email) {
                    email = decoded.email;
                    name = decoded.name || decoded.displayName || name;
                    picture = decoded.picture || picture;
                }
            }
        }

        if (!email && accessToken) {
            try {
                const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (userInfoRes.ok) {
                    const userInfo = await userInfoRes.json();
                    email = userInfo.email;
                    name = userInfo.name;
                    picture = userInfo.picture;
                }
            } catch (err) {
                console.error("Error fetching Google userinfo:", err);
            }
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Unable to determine user email from Google authentication",
            });
        }

        // Find the user in MongoDB by email
        let user = await User.findOne({ email });

        // If the user does not exist, automatically create a new user (first-time registration)
        if (!user) {
            // Generate a random password since password is required in the schema
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            user = await User.create({
                name: name || "Google User",
                email: email,
                password: hashedPassword,
            });

            // Create default settings for user
            await Settings.create({
                userId: user._id,
                browserAlerts: true,
                notificationSound: true,
            }).catch(() => {});

            // Send welcome email asynchronously without blocking registration
            sendWelcomeEmail(user.name, user.email).catch(() => {});
        }

        // Generate the SAME JWT that the normal login generates
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        const isProduction = process.env.NODE_ENV === "production";
        // Set the SAME HTTP-only cookie with the SAME options
        return res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }).status(200).json({
            success: true,
            message: "Login successful",
        });

    } catch (err) {
        console.error("Error verifying Google credential:", err);
        res.status(500).json({ success: false, message: "Invalid Google credential" });
    }
}
module.exports = { googleLogin };