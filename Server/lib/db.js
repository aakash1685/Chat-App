import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI + "/chat-app");
        console.log("Databse Connected")
    } catch (error) {
        console.log("Database Error: ", error);
    }
}