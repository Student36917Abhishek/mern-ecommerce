const validator = require("validator");

const validateRegister = (req, res, next) => {
const { name, email, password } = req.body;
if (!name || !email || !password) {
return res.status(400).json({ message: "Name, email and password are required." });
}
if (!validator.isEmail(email)) {
return res.status(400).json({ message: "Invalid email format." });
}
if (String(password).length < 6) {
return res.status(400).json({ message: "Password must be at least 6 characters." });
}
next();
};

const validateLogin = (req, res, next) => {
const { email, password } = req.body;
if (!email || !password) {
return res.status(400).json({ message: "Email and password are required." });
}
if (!validator.isEmail(email)) {
return res.status(400).json({ message: "Invalid email format." });
}
next();
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const validateProductCreate = (req, res, next) => {
const { name, description, price, category, stock, image } = req.body;

if (!name || !description || price === undefined) {
return res.status(400).json({ message: "Name, description and price are required." });
}

if (typeof name !== "string" || name.trim().length < 2) {
return res.status(400).json({ message: "Product name must be at least 2 characters." });
}

if (typeof description !== "string" || description.trim().length < 5) {
return res.status(400).json({ message: "Description must be at least 5 characters." });
}

if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
return res.status(400).json({ message: "Price must be a non-negative number." });
}

if (category !== undefined && typeof category !== "string") {
return res.status(400).json({ message: "Category must be a string." });
}

if (stock !== undefined && (typeof stock !== "number" || Number.isNaN(stock) || stock < 0)) {
return res.status(400).json({ message: "Stock must be a non-negative number." });
}

if (image !== undefined && typeof image !== "string") {
return res.status(400).json({ message: "Image must be a string." });
}

next();
};

const validateProductUpdate = (req, res, next) => {
const allowed = ["name", "description", "price", "category", "stock", "image"];
const bodyKeys = Object.keys(req.body);

if (bodyKeys.length === 0) {
return res.status(400).json({ message: "Provide at least one field to update." });
}

const invalidField = bodyKeys.find((key) => !allowed.includes(key));
if (invalidField) {
return res.status(400).json({ message: `Invalid update field: ${invalidField}` });
}

if (hasOwn(req.body, "name")) {
if (typeof req.body.name !== "string" || req.body.name.trim().length < 2) {
return res.status(400).json({ message: "Product name must be at least 2 characters." });
}
}

if (hasOwn(req.body, "description")) {
if (typeof req.body.description !== "string" || req.body.description.trim().length < 5) {
return res.status(400).json({ message: "Description must be at least 5 characters." });
}
}

if (hasOwn(req.body, "price")) {
if (typeof req.body.price !== "number" || Number.isNaN(req.body.price) || req.body.price < 0) {
return res.status(400).json({ message: "Price must be a non-negative number." });
}
}

if (hasOwn(req.body, "category") && typeof req.body.category !== "string") {
return res.status(400).json({ message: "Category must be a string." });
}

if (hasOwn(req.body, "stock")) {
if (typeof req.body.stock !== "number" || Number.isNaN(req.body.stock) || req.body.stock < 0) {
return res.status(400).json({ message: "Stock must be a non-negative number." });
}
}

if (hasOwn(req.body, "image") && typeof req.body.image !== "string") {
return res.status(400).json({ message: "Image must be a string." });
}

next();
};

module.exports = {
validateRegister,
validateLogin,
validateProductCreate,
validateProductUpdate
};