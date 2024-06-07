import connectMongoDB from "@/libs/mongodb";
import Service from "@/models/Service";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { id } = params;
  const data = await request.json();
  
  // Ensure _id is not included in the data being updated
  const { _id, ...updateData } = data;
  await connectMongoDB();
  const service = await Service.findByIdAndUpdate(id, updateData, { new: true });
  return NextResponse.json(service, { status: 201 });
}
