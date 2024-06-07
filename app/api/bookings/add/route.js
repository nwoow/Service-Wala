import connectMongoDB from "@/libs/mongodb";
import Booking from "@/models/booking";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();
  await connectMongoDB();
  const booking = await Booking.create(data);
  return NextResponse.json(booking, { status: 201 });
}
