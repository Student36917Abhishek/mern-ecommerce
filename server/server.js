const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { sendSuccess } = require("./utils/apiResponse");

dotenv.config();
connectDB();

const app = express();

const sanitizeObject = (value) => {
if (!value || typeof value !== "object") {
return value;
}

if (Array.isArray(value)) {
return value.map((item) => sanitizeObject(item));
}

for (const key of Object.keys(value)) {
if (key.startsWith("$") || key.includes(".")) {
delete value[key];
continue;
}

value[key] = sanitizeObject(value[key]);
}

return value;
};

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use((req, res, next) => {
sanitizeObject(req.body);
sanitizeObject(req.params);
next();
});

app.get("/", (req, res) => {
	return sendSuccess(res, 200, "Ecommerce API running.");
});

app.get("/api/health", (req, res) => {
res.status(200).json({ status: "ok", message: "Backend is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});