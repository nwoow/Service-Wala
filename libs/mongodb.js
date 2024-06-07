import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    // console.log("connected to mongoDB");
  } catch {
    console.log("error connecting to mongoDB");
  }
};
export default connectMongoDB;
