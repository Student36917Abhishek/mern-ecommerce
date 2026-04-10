const express=require("express");
const app=express();
const cors=require("cors");
const dotenv=require("dotenv");
const connectDB=require("./config/db");

dotenv.config();

//connect database on startup
connectDB();

//middleware
app.use(cors());
app.use(express.json());

//Basic test route
app.get("/",(req,res)=>{
    res.send("Ecommerce API running");
});

//optional health route for quick check
app.get("/api/health",(req,res)=>{
    res.status(200).json({
        status:"ok",
        message:"Backend is healthy",
    });
});

const PORT=process.env.PORT||5000;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});

