const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const addressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        line1: {
            type: String,
            trim: true,
        },
        line2: {
            type: String,
            trim: true,
            default: "",
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        postalCode: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: false,
    }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        avatar: {
            type: String,
            default: "",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerifyToken: {
            type: String,
            default: null,
            select: false,
        },
        resetPasswordToken: {
            type: String,
            default: null,
            select: false,
        },
        resetPasswordExpire: {
            type: Date,
            default: null,
            select: false,
        },
        addresses: {
            type: [addressSchema],
            default: [],
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.createEmailVerifyToken = function () {
    const rawToken = crypto.randomBytes(32).toString("hex");
    this.emailVerifyToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    return rawToken;
};

userSchema.methods.createResetPasswordToken = function () {
    const rawToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return rawToken;
};

module.exports = mongoose.model("User", userSchema);