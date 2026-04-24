import mongoose from "mongoose";
import * as dotenv from 'dotenv';
dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI as string);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};