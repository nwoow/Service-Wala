import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    cartItems: {
      type: [],
      required: true,
    },
    status: {
      type: String,
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
    fullname: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: {
      type: String,
    },
    profileImage: {
      type: Object,
    },
    feedback: {
      type: String,
    },
    sendedToServiceProvider: {
      type: Boolean,
    },
    paymentCompleted: {
      type: Boolean,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    paymentMethod: { type: String, required: true },
    verificationImage: {
      type: Object,
      default: {
        url: "",
        name: "",
      },
    },
    availableServiceProviders: {
      type: Array,
      default: [],
    },
    assignedServiceProviders: {
      type: Array,
      default: [],
    },
    location: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
