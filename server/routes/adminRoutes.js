const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { sendSuccess } = require("../utils/apiResponse");
const { logAudit } = require("../utils/auditLogger");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      lowStockProducts,
      revenueResult,
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1, updatedAt: -1 }).limit(6),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$grandTotal" },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$orderStatus", "placed"] }, 1, 0] },
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
            },
          },
        },
      ]),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .select("_id user totalItems grandTotal paymentMethod paymentStatus orderStatus createdAt"),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role isEmailVerified createdAt"),
    ]);

    const revenueStats = revenueResult[0] || {
      totalRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
    };

    return sendSuccess(res, 200, "Admin dashboard fetched successfully.", {
      metrics: {
        totalUsers,
        totalProducts,
        totalOrders,
        lowStockCount: lowStockProducts.length,
        totalRevenue: Number((revenueStats.totalRevenue || 0).toFixed(2)),
        pendingOrders: revenueStats.pendingOrders || 0,
        deliveredOrders: revenueStats.deliveredOrders || 0,
      },
      lowStockProducts,
      recentOrders,
      recentUsers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select("name email role avatar isEmailVerified addresses createdAt updatedAt");

    return sendSuccess(res, 200, "Registered users fetched successfully.", {
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/seller-requests", async (req, res) => {
  try {
    const requests = await User.find({ "sellerRequest.status": "pending" })
      .sort({ "sellerRequest.requestedAt": 1 })
      .select("name email role sellerRequest createdAt");

    return sendSuccess(res, 200, "Pending seller requests fetched successfully.", {
      count: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/audit-logs", async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("actor", "name email")
      .select("actor actorRole action targetType targetId details createdAt");

    return sendSuccess(res, 200, "Recent audit logs fetched successfully.", {
      count: logs.length,
      logs,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/seller-requests/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const action = String(req.body?.action || "").toLowerCase();
    const reviewNote = typeof req.body?.reviewNote === "string" ? req.body.reviewNote.trim() : "";

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Action must be either approve or reject." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.sellerRequest?.status !== "pending") {
      return res.status(400).json({ message: "This seller request is not pending." });
    }

    if (action === "approve") {
      user.role = "seller";
      user.sellerRequest.status = "approved";
    } else {
      user.sellerRequest.status = "rejected";
    }

    user.sellerRequest.reviewedAt = new Date();
    user.sellerRequest.reviewedBy = req.user._id;
    user.sellerRequest.reviewNote = reviewNote;

    await user.save();

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: action === "approve" ? "seller_request_approved" : "seller_request_rejected",
      targetType: "user",
      targetId: user._id,
      details: {
        previousRole: action === "approve" ? "user" : user.role,
        nextRole: user.role,
        reviewNote,
      },
    });

    const resultLabel = action === "approve" ? "approved" : "rejected";

    return sendSuccess(res, 200, `Seller request ${resultLabel} successfully.`, {
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
