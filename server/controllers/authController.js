const crypto = require("crypto");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

const sanitizeUser = (user) => ({
id: user._id,
name: user.name,
email: user.email,
role: user.role,
avatar: user.avatar,
isEmailVerified: user.isEmailVerified,
addresses: user.addresses
});

const registerUser = async (req, res) => {
try {
const { name, email, password } = req.body;

const existing = await User.findOne({ email: email.toLowerCase() });
if (existing) return res.status(400).json({ message: "User already exists." });

const user = new User({ name, email, password });
const verifyToken = user.createEmailVerifyToken();
await user.save();

const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

return res.status(201).json({
message: "Registration successful.",
accessToken,
refreshToken,
user: sanitizeUser(user),
emailVerificationTokenDevOnly:
process.env.NODE_ENV === "development" ? verifyToken : undefined
});
} catch (error) {
return res.status(500).json({ message: error.message });
}
};

const loginUser = async (req, res) => {
try {
const { email, password } = req.body;

const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
if (!user) return res.status(400).json({ message: "Invalid credentials." });

const matched = await user.comparePassword(password);
if (!matched) return res.status(400).json({ message: "Invalid credentials." });

const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

return res.status(200).json({
message: "Login successful.",
accessToken,
refreshToken,
user: sanitizeUser(user)
});
} catch (error) {
return res.status(500).json({ message: error.message });
}
};

const getProfile = async (req, res) => {
return res.status(200).json({ user: sanitizeUser(req.user) });
};

const updateProfile = async (req, res) => {
try {
const allowed = ["name", "avatar", "addresses"];
const updates = {};
for (const key of allowed) {
if (req.body[key] !== undefined) updates[key] = req.body[key];
}

const user = await User.findByIdAndUpdate(req.user._id, updates, {
returnDocument: "after",
runValidators: true
});

return res.status(200).json({ message: "Profile updated.", user: sanitizeUser(user) });
} catch (error) {
return res.status(500).json({ message: error.message });
}
};

const forgotPassword = async (req, res) => {
try {
const { email } = req.body;
const user = await User.findOne({ email: email.toLowerCase() }).select("+resetPasswordToken +resetPasswordExpire");
if (!user) return res.status(404).json({ message: "User not found." });

const resetToken = user.createResetPasswordToken();
await user.save();

const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
return res.status(200).json({
message: "Reset link generated.",
resetUrlDevOnly: process.env.NODE_ENV === "development" ? resetUrl : undefined
});
} catch (error) {
return res.status(500).json({ message: error.message });
}
};

const resetPassword = async (req, res) => {
try {
const tokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
const user = await User.findOne({
resetPasswordToken: tokenHash,
resetPasswordExpire: { $gt: Date.now() }
}).select("+password +resetPasswordToken +resetPasswordExpire");

if (!user) return res.status(400).json({ message: "Invalid or expired reset token." });

user.password = req.body.password;
user.resetPasswordToken = null;
user.resetPasswordExpire = null;
await user.save();

return res.status(200).json({ message: "Password reset successful." });
} catch (error) {
return res.status(500).json({ message: error.message });
}
};

const verifyEmail = async (req, res) => {
try {
const tokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
const user = await User.findOne({ emailVerifyToken: tokenHash }).select("+emailVerifyToken");
if (!user) return res.status(400).json({ message: "Invalid verification token." });

user.isEmailVerified = true;
user.emailVerifyToken = null;
await user.save();

return res.status(200).json({ message: "Email verified successfully." });
} catch (error) {
return res.status(500).json({ message: error.message });
}
};

const logoutUser = async (req, res) => {
return res.status(200).json({ message: "Logout successful. Please discard tokens on client." });
};

module.exports = {
registerUser,
loginUser,
getProfile,
updateProfile,
forgotPassword,
resetPassword,
verifyEmail,
logoutUser
};