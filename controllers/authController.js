const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

exports.signup = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) 
        return res.status(400).json({ message: "All fields are required" });

    try {
        const user = await User.create({ email, password, role });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const verificationLink = `${process.env.BASE_URL}/verify-email/${token}`;

        await sendEmail(email, "Verify Your Email", `Click here to verify your email: ${verificationLink}`);
        res.status(201).json({ message: "Signup successful, check your email to verify your account" });
    } catch (err) {
        res.status(500).json({ message: "Error signing up", error: err.message });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.isVerified = true;
        await user.save();
        res.status(200).json({ message: "Email verified successfully" });
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) 
        return res.status(400).json({ message: "All fields are required" });

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.isVerified) 
            return res.status(403).json({ message: "Please verify your email before logging in" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, message: "Login successful" });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};
