const User = require("../models/User");

const ensureDefaultAdmin = async () => {
  try {
    const autoSeedEnabled = String(process.env.AUTO_SEED_ADMIN || "true").toLowerCase() !== "false";
    if (!autoSeedEnabled) {
      return;
    }

    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount > 0) {
      return;
    }

    const adminName = process.env.ADMIN_NAME || "Project Admin";
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@ecommerce.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
    const resetPassword = String(process.env.RESET_ADMIN_PASSWORD_ON_BOOT || "true").toLowerCase() !== "false";

    let user = await User.findOne({ email: adminEmail }).select("+password");

    if (!user) {
      user = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isEmailVerified: true,
      });
      await user.save();
      console.log(`Default admin created: ${adminEmail}`);
    } else {
      user.role = "admin";
      user.isEmailVerified = true;
      if (resetPassword) {
        user.password = adminPassword;
      }
      await user.save();
      console.log(`Existing user promoted as default admin: ${adminEmail}`);
    }

    console.log("Default admin password:", adminPassword);
  } catch (error) {
    console.error("Default admin bootstrap failed:", error.message);
  }
};

module.exports = { ensureDefaultAdmin };