const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 10,
standardHeaders: true,
legacyHeaders: false,
message: { message: "Too many auth requests. Try again later." }
});

const passwordLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 5,
standardHeaders: true,
legacyHeaders: false,
message: { message: "Too many password reset attempts. Try again later." }
});

module.exports = { authLimiter, passwordLimiter };