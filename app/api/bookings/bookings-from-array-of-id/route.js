import connectMongoDB from "@/libs/mongodb";
import Booking from "@/models/booking";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse the request body to get the array of service IDs
    const serviceIds = await request.json();

    // Ensure serviceIds is an array of valid MongoDB ObjectIDs
    if (!Array.isArray(serviceIds)) {
      return NextResponse.json(
        { error: "Invalid booking IDs" },
        { status: 400 }
      );
    }
    // Connect to MongoDB
    await connectMongoDB();
    // Fetch the services using the $in operator
    const services = await Booking.find({ _id: { $in: serviceIds } });

    return NextResponse.json(services, { status: 201 });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
