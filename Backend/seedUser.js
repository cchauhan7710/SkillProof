import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/models/User.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const existingUser = await User.findOne({ email: "test@example.com" });
        if (existingUser) {
            console.log("User already exists. Deleting...");
            await User.deleteOne({ email: "test@example.com" });
        }

        const user = new User({
            fullname: "Test User",
            username: "testuser",
            email: "test@example.com",
            password: "password123",
            avatar: "https://via.placeholder.com/150"
        });

        await user.save();
        console.log("Test user created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding user:", error);
        process.exit(1);
    }
};

seedUser();
