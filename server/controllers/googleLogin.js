const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const client = new OAuth2Client(process.env.CLIENT_ID);

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required",
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const {
            sub,
            email,
            name,
            picture,
        } = payload;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email not provided by Google account",
            });
        }

        // Find the user in MongoDB by email
        let user = await User.findOne({ email });

        // If the user does not exist, automatically create a new user
        if (!user) {
            // Generate a random password since password is required in the schema
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            user = await User.create({
                name: name || "Google User",
                email: email,
                password: hashedPassword,
            });
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

        // Set the SAME HTTP-only cookie with the SAME options
        return res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
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