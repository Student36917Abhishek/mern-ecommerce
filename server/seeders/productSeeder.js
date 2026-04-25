const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sampleProducts = [
  {
    name: "Running Shoes",
    description: "Comfortable sports shoes for daily running.",
    price: 2999,
    category: "Footwear",
    stock: 50,
    image: "running-shoes.jpg",
  },
  {
    name: "Wireless Headphones",
    description: "Bluetooth over-ear headphones with deep bass.",
    price: 4999,
    category: "Electronics",
    stock: 35,
    image: "wireless-headphones.jpg",
  },
  {
    name: "Cotton T-Shirt",
    description: "Soft cotton round-neck t-shirt for everyday wear.",
    price: 799,
    category: "Clothing",
    stock: 120,
    image: "cotton-tshirt.jpg",
  },
  {
    name: "Smart Watch",
    description: "Fitness tracking smartwatch with heart-rate monitor.",
    price: 6999,
    category: "Electronics",
    stock: 25,
    image: "smart-watch.jpg",
  },
  {
    name: "Backpack",
    description: "Durable laptop backpack with multiple compartments.",
    price: 1999,
    category: "Accessories",
    stock: 60,
    image: "backpack.jpg",
  },
];

const importData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);

    console.log("Sample products inserted successfully.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeder failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();

    console.log("All products removed successfully.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Destroy failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

if (process.argv[2] === "--destroy") {
  destroyData();
} else {
  importData();
}
