import connectMongoDB from "@/libs/mongodb";
import User from "@/models/users";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();

  const users = await User.find();
  const serviceProviders = users.filter((u) => u.role === "service-provider");

  return NextResponse.json(serviceProviders, { status: 201 });
}
