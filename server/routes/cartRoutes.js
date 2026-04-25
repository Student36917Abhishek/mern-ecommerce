const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");
const { sendSuccess } = require("../utils/apiResponse");

const router = express.Router();
const MAX_ITEM_QUANTITY = 10;
const TAX_RATE = 0.18;
const SHIPPING_FEE = 99;
const FREE_SHIPPING_THRESHOLD = 1000;

const recalculateCartTotals = (cart) => {
  let subtotal = 0;
  let totalItems = 0;

  for (const item of cart.items) {
    subtotal += item.price * item.quantity;
    totalItems += item.quantity;
  }

  const tax = subtotal * TAX_RATE;
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = subtotal + tax + shippingFee;

  cart.subtotal = Number(subtotal.toFixed(2));
  cart.tax = Number(tax.toFixed(2));
  cart.shippingFee = Number(shippingFee.toFixed(2));
  cart.grandTotal = Number(grandTotal.toFixed(2));
  cart.totalItems = totalItems;
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      subtotal: 0,
      tax: 0,
      shippingFee: 0,
      grandTotal: 0,
      totalItems: 0,
    });
  }
  return cart;
};

const buildCartSummary = (cart) => ({
  totalItems: cart.totalItems,
  subtotal: cart.subtotal,
  tax: cart.tax,
  shippingFee: cart.shippingFee,
  grandTotal: cart.grandTotal,
});

const sendCartResponse = (res, message, cart, statusCode = 200) => {
  return sendSuccess(res, statusCode, message, {
    cart,
    summary: buildCartSummary(cart),
  });
};

const syncCartWithProducts = async (cart) => {
  if (!cart.items.length) {
    recalculateCartTotals(cart);
    return;
  }

  const productIds = cart.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const nextItems = [];
  for (const item of cart.items) {
    const product = productMap.get(String(item.product));
    if (!product || product.stock <= 0) {
      continue;
    }

    const maxAllowed = Math.min(product.stock, MAX_ITEM_QUANTITY);
    const adjustedQty = Math.min(item.quantity, maxAllowed);
    if (adjustedQty <= 0) {
      continue;
    }

    nextItems.push({
      product: product._id,
      name: product.name,
      image: product.image || "",
      price: product.price,
      quantity: adjustedQty,
    });
  }

  cart.items = nextItems;
  recalculateCartTotals(cart);
};

router.get("/", protect, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await syncCartWithProducts(cart);
    await cart.save();
    return sendCartResponse(res, "Cart fetched successfully.", cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/checkout-preview", protect, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await syncCartWithProducts(cart);
    await cart.save();

    if (!cart.items.length) {
      return res.status(400).json({
        message: "Cart is empty. Add items before checkout.",
        cart,
        summary: buildCartSummary(cart),
        canCheckout: false,
      });
    }

    return sendSuccess(res, 200, "Checkout preview ready.", {
      cart,
      summary: buildCartSummary(cart),
      canCheckout: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid productId is required." });
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1) {
      return res.status(400).json({ message: "Quantity must be an integer greater than 0." });
    }

    if (parsedQty > MAX_ITEM_QUANTITY) {
      return res.status(400).json({ message: `Maximum quantity per item is ${MAX_ITEM_QUANTITY}.` });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: "Product is out of stock." });
    }

    if (parsedQty > product.stock) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock." });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find((item) => String(item.product) === String(product._id));

    if (existingItem) {
      const nextQty = existingItem.quantity + parsedQty;
      if (nextQty > product.stock) {
        return res.status(400).json({ message: "Requested quantity exceeds available stock." });
      }
      if (nextQty > MAX_ITEM_QUANTITY) {
        return res.status(400).json({ message: `Maximum quantity per item is ${MAX_ITEM_QUANTITY}.` });
      }
      existingItem.quantity = nextQty;
      existingItem.price = product.price;
      existingItem.name = product.name;
      existingItem.image = product.image || "";
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.image || "",
        price: product.price,
        quantity: parsedQty,
      });
    }

    recalculateCartTotals(cart);
    await cart.save();

    return sendCartResponse(res, "Item added to cart.", cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1) {
      return res.status(400).json({ message: "Quantity must be an integer greater than 0." });
    }

    if (parsedQty > MAX_ITEM_QUANTITY) {
      return res.status(400).json({ message: `Maximum quantity per item is ${MAX_ITEM_QUANTITY}.` });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: "Product is out of stock." });
    }

    if (parsedQty > product.stock) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock." });
    }

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((cartItem) => String(cartItem.product) === String(productId));

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart." });
    }

    item.quantity = parsedQty;
    item.price = product.price;
    item.name = product.name;
    item.image = product.image || "";

    recalculateCartTotals(cart);
    await cart.save();

    return sendCartResponse(res, "Cart item updated.", cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const cart = await getOrCreateCart(req.user._id);
    const beforeCount = cart.items.length;
    cart.items = cart.items.filter((item) => String(item.product) !== String(productId));

    if (cart.items.length === beforeCount) {
      return res.status(404).json({ message: "Item not found in cart." });
    }

    recalculateCartTotals(cart);
    await cart.save();

    return sendCartResponse(res, "Item removed from cart.", cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/", protect, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    recalculateCartTotals(cart);
    await cart.save();

    return sendCartResponse(res, "Cart cleared.", cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
