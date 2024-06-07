import connectMongoDB from "@/libs/mongodb";
import Service from "@/models/Service";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();
  const services = await Service.find();
  return NextResponse.json(services, { status: 201 });
}
