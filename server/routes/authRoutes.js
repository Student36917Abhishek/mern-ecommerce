const express = require("express");
const {
registerUser,
loginUser,
getProfile,
updateProfile,
forgotPassword,
resetPassword,
verifyEmail,
logoutUser,
submitSellerRequest
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter, passwordLimiter } = require("../middleware/rateLimiter");
const { validateRegister, validateLogin } = require("../middleware/validateRequest");

const router = express.Router();

router.post("/register", authLimiter, validateRegister, registerUser);
router.post("/login", authLimiter, validateLogin, loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/seller-request", protect, submitSellerRequest);
router.post("/logout", protect, logoutUser);
router.post("/forgot-password", passwordLimiter, forgotPassword);
router.post("/reset-password/:token", passwordLimiter, resetPassword);
router.get("/verify-email/:token", verifyEmail);

module.exports = router;