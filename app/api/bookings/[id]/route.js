import connectMongoDB from "@/libs/mongodb";
import Booking from "@/models/booking";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;
  //   console.log(id);
  await connectMongoDB();
  const booking = await Booking.findById(id);
  return NextResponse.json(booking, { status: 201 });
}

// export async function POST(request) {
//   const data = await request.json();
//   // console.log(data);
//   await connectMongoDB();
//   await User.findByIdAndUpdate(data._id, data);
//   return NextResponse.json("Service Provider Updated", { status: 201 });
// }
export async function PUT(request, { params }) {
  const { id } = params;
  const data = await request.json();
  // console.log(id, data);
  await connectMongoDB();
  const updatedBooking = await Booking.findByIdAndUpdate(id, data);
  return NextResponse.json(updatedBooking, { status: 201 });
}

// export async function DELETE(request) {
//   const data = await request.json();
//   // console.log(data);
//   await connectMongoDB();
//   await User.findByIdAndDelete(data._id);
//   return NextResponse.json("Service Provider Deleted", { status: 201 });
// }
