import connectMongoDB from "@/libs/mongodb";
import Service from "@/models/Service";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { name, status, rank, tags, icon, images } = await request.json();
  // console.log(name, status, rank, tags, icon, images);
  await connectMongoDB();
  const service = await Service.create({
    name,
    status,
    rank,
    tags,
    icon,
    images,
  });
  return NextResponse.json(service, { status: 201 });
}
