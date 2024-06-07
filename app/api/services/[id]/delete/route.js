import connectMongoDB from "@/libs/mongodb";
import Service from "@/models/Service";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  const { id } = params;
  await connectMongoDB();
  await Service.findByIdAndDelete(id);
  return NextResponse.json("Successfully Deleted the service", { status: 201 });
}
