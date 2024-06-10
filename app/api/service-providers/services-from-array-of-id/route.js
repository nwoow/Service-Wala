import connectMongoDB from "@/libs/mongodb";
import Service from "@/models/Service";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Parse the request body to get the array of service IDs
    const serviceIds = await request.json();

    // Ensure serviceIds is an array of valid MongoDB ObjectIDs
    if (
      !Array.isArray(serviceIds) ||
      !serviceIds.every((id) => mongoose.Types.ObjectId.isValid(id))
    ) {
      return NextResponse.json(
        { error: "Invalid service IDs" },
        { status: 400 }
      );
    }

    // Fetch the services using the $in operator
    const services = await Service.find({ _id: { $in: serviceIds } });

    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
