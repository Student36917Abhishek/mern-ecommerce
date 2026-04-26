const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const ADMIN_NAME = process.env.ADMIN_NAME || "Project Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ecommerce.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const RESET_ADMIN_PASSWORD = String(process.env.RESET_ADMIN_PASSWORD || "true").toLowerCase() !== "false";

const seedAdmin = async () => {
  try {
    await connectDB();

    let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }).select("+password");

    if (!user) {
      user = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        password: ADMIN_PASSWORD,
        role: "admin",
        isEmailVerified: true,
      });

      await user.save();
      console.log(`Admin user created: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
    } else {
      if (user.role !== "admin") {
        user.role = "admin";
      }
      user.isEmailVerified = true;
      if (RESET_ADMIN_PASSWORD) {
        user.password = ADMIN_PASSWORD;
      }
      await user.save();
      console.log(`Existing user promoted/confirmed as admin: ${ADMIN_EMAIL}`);
      if (RESET_ADMIN_PASSWORD) {
        console.log(`Password reset to: ${ADMIN_PASSWORD}`);
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();
