const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { protect, sellerOrAdmin } = require("../middleware/authMiddleware");
const { sendSuccess } = require("../utils/apiResponse");
const { logAudit } = require("../utils/auditLogger");
const {
  validateProductCreate,
  validateProductUpdate,
} = require("../middleware/validateRequest");

const router = express.Router();

router.post("/", protect, sellerOrAdmin, validateProductCreate, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      seller: req.user.role === "seller" ? req.user._id : req.body.seller || null,
    });
    const savedProduct = await product.save();

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: "product_created",
      targetType: "product",
      targetId: savedProduct._id,
      details: {
        name: savedProduct.name,
        price: savedProduct.price,
        stock: savedProduct.stock,
      },
    });

    return sendSuccess(res, 201, "Product created successfully.", { product: savedProduct });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/mine", protect, sellerOrAdmin, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { seller: req.user._id };
    const products = await Product.find(query).sort({ createdAt: -1 });

    return sendSuccess(res, 200, "My products fetched successfully.", {
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      category,
      minPrice,
      maxPrice,
      sort = "newest",
      page = "1",
      limit = "10",
    } = req.query;

    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (numericPage - 1) * numericLimit;

    const query = {};

    if (search && String(search).trim()) {
      query.name = { $regex: String(search).trim(), $options: "i" };
    }

    if (category && String(category).trim()) {
      query.category = { $regex: `^${String(category).trim()}$`, $options: "i" };
    }

    const priceFilter = {};
    const parsedMinPrice = minPrice !== undefined ? Number(minPrice) : undefined;
    const parsedMaxPrice = maxPrice !== undefined ? Number(maxPrice) : undefined;

    if (parsedMinPrice !== undefined && !Number.isNaN(parsedMinPrice)) {
      priceFilter.$gte = parsedMinPrice;
    }
    if (parsedMaxPrice !== undefined && !Number.isNaN(parsedMaxPrice)) {
      priceFilter.$lte = parsedMaxPrice;
    }
    if (Object.keys(priceFilter).length > 0) {
      query.price = priceFilter;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };

    const sortOption = sortMap[String(sort)] || sortMap.newest;

    const [products, totalProducts] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(numericLimit),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.max(Math.ceil(totalProducts / numericLimit), 1);

    return sendSuccess(res, 200, "Products fetched successfully.", {
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: numericPage,
        pageSize: numericLimit,
      },
      filters: {
        search: String(search || ""),
        category: category ? String(category) : "",
        minPrice: parsedMinPrice,
        maxPrice: parsedMaxPrice,
        sort: String(sort),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return sendSuccess(res, 200, "Product fetched successfully.", { product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protect, sellerOrAdmin, validateProductUpdate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const updates = {};
    const allowed = ["name", "description", "price", "category", "stock", "image"];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = String(product.seller) === String(req.user._id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "You can update only your own products." });
    }

    const previousSnapshot = {
      price: product.price,
      stock: product.stock,
    };

    for (const key of Object.keys(updates)) {
      product[key] = updates[key];
    }

    await product.save();

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: "product_updated",
      targetType: "product",
      targetId: product._id,
      details: {
        previousPrice: previousSnapshot.price,
        nextPrice: product.price,
        previousStock: previousSnapshot.stock,
        nextStock: product.stock,
      },
    });

    return sendSuccess(res, 200, "Product updated successfully.", { product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, sellerOrAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = String(product.seller) === String(req.user._id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "You can delete only your own products." });
    }

    await Product.findByIdAndDelete(req.params.id);

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: "product_deleted",
      targetType: "product",
      targetId: req.params.id,
      details: {
        name: product.name,
      },
    });

    return sendSuccess(res, 200, "Product deleted successfully.");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
