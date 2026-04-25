const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { sendSuccess } = require("../utils/apiResponse");

const router = express.Router();
const TAX_RATE = 0.18;
const SHIPPING_FEE = 99;
const FREE_SHIPPING_THRESHOLD = 1000;

const calculateTotals = (items) => {
  let subtotal = 0;
  let totalItems = 0;

  for (const item of items) {
    subtotal += item.price * item.quantity;
    totalItems += item.quantity;
  }

  const tax = subtotal * TAX_RATE;
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = subtotal + tax + shippingFee;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    shippingFee: Number(shippingFee.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    totalItems,
  };
};

const isValidShippingAddress = (address) => {
  if (!address || typeof address !== "object") return false;

  const required = ["fullName", "phone", "line1", "city", "state", "postalCode", "country"];
  return required.every((field) => typeof address[field] === "string" && address[field].trim().length > 0);
};

router.get("/meta", protect, (req, res) => {
  return sendSuccess(res, 200, "Order module metadata fetched.", {
    paymentMethods: ["cod", "card", "upi"],
    paymentStatuses: ["pending", "paid", "failed", "refunded"],
    orderStatuses: ["placed", "processing", "shipped", "delivered", "cancelled"],
  });
});

router.post("/", protect, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "cod", notes = "" } = req.body;

    if (!isValidShippingAddress(shippingAddress)) {
      return res.status(400).json({ message: "Valid shipping address is required." });
    }

    const allowedPaymentMethods = ["cod", "card", "upi"];
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: "Cart is empty. Cannot place order." });
    }

    const productIds = cart.items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const orderItems = [];
    for (const cartItem of cart.items) {
      const product = productMap.get(String(cartItem.product));

      if (!product) {
        return res.status(400).json({ message: "A product in your cart no longer exists." });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}.`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image || "",
        price: product.price,
        quantity: cartItem.quantity,
      });
    }

    const totals = calculateTotals(orderItems);

    const paymentStatus = paymentMethod === "cod" ? "pending" : "pending";
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        line1: shippingAddress.line1.trim(),
        line2: typeof shippingAddress.line2 === "string" ? shippingAddress.line2.trim() : "",
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country.trim(),
      },
      totalItems: totals.totalItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shippingFee: totals.shippingFee,
      grandTotal: totals.grandTotal,
      paymentMethod,
      paymentStatus,
      notes: typeof notes === "string" ? notes.trim() : "",
    });

    await Promise.all(
      orderItems.map((item) =>
        Product.updateOne(
          { _id: item.product },
          {
            $inc: { stock: -item.quantity },
          }
        )
      )
    );

    cart.items = [];
    cart.totalItems = 0;
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shippingFee = 0;
    cart.grandTotal = 0;
    await cart.save();

    return sendSuccess(res, 201, "Order placed successfully.", { order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select(
        "_id totalItems subtotal tax shippingFee grandTotal paymentMethod paymentStatus orderStatus isPaid createdAt"
      );

    return sendSuccess(res, 200, "My orders fetched successfully.", {
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .select(
        "_id user totalItems subtotal tax shippingFee grandTotal paymentMethod paymentStatus orderStatus isPaid createdAt"
      );

    const totalOrders = orders.length;
    const totalRevenue = Number(
      orders.reduce((sum, order) => sum + Number(order.grandTotal || 0), 0).toFixed(2)
    );

    return sendSuccess(res, 200, "All orders fetched successfully.", {
      count: totalOrders,
      totalRevenue,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/admin/:id/status", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const { orderStatus } = req.body;
    const allowedStatuses = ["placed", "processing", "shipped", "delivered", "cancelled"];

    if (!orderStatus || !allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "delivered") {
      order.deliveredAt = new Date();
    } else {
      order.deliveredAt = null;
    }

    await order.save();

    return sendSuccess(res, 200, "Order status updated successfully.", { order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const order = await Order.findById(req.params.id).populate("orderItems.product", "name price image");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const isOwner = String(order.user) === String(req.user._id);
    if (!isOwner) {
      return res.status(403).json({ message: "Access denied for this order." });
    }

    return sendSuccess(res, 200, "Order details fetched successfully.", { order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
