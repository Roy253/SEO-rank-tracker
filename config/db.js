import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => console.log("MongoDB connected"));
    mongoose.connection.on("error", (err) => console.log("MongoDB connection error: ", err));
    await mongoose.connect(process.env.MONGODB_URI);
};

export default connectDB;