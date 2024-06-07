import mongoose, { Schema } from "mongoose";


const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: {
        url: String,
        name: String,
      },
      default: {
        url: "",
        name: "",
      },
    },
    email: {
      type: String,
      unique: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "Unspecified"], // Example enum values, adjust as needed
    },
    locations: {
      type: [String],
      default: [],
    },
    city: {
      type: String,
    },
    active: {
      type: Boolean,
    },
    role: {
      type: String,
    },
    serviceHistory: {
      type: [Schema.Types.ObjectId], // Assuming these are references to other documents
      default: [],
    },
    password: {
      type: String,
      required: true,
    },
    aadhar: {
      type: String,
      unique: true,
    },
    services: {
      type: Array,
      default: [],
    },
    reviews: {
      type: [Schema.Types.ObjectId], // Assuming these are references to other documents
      default: [],
    },
    bookings: {
      type: [Schema.Types.ObjectId], // Assuming these are references to other documents
      default: [],
    },
    payments: {
      type: [Schema.Types.ObjectId], // Assuming these are references to other documents
      default: [],
    },
    messages: {
      type: [Schema.Types.ObjectId], // Assuming these are references to other documents
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
