import connectMongoDB from "@/libs/mongodb";
import Service from "@/models/Service";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

function getCurrentDateFormatted() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, "0");
  const month = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  return `${day} ${month} ${year}`;
}

// Example usage:
const formattedDate = getCurrentDateFormatted();
export async function POST(request, { params }) {
  const { id } = params;
  const { name, status, price, icon } = await request.json();
  
  // console.log(name, status, price, icon, id);
  await connectMongoDB();
  const service = await Service.findById(id);
  service.subServices.push({
    _id: new mongoose.Types.ObjectId(),
    serviceId: id,
    name,
    status,
    price,
    icon,
    reviews: [],
    bookings: [],
    createdDate: formattedDate,
  });
  const savedService = await service.save();
  return NextResponse.json(savedService, { status: 201 });
}
