import connectMongoDB from "@/libs/mongodb";
import User from "@/models/users";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();
  console.log(data);
  await connectMongoDB();
  const user = await User.create(data);
  return NextResponse.json(user, { status: 201 });
}
