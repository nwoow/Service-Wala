import connectMongoDB from "@/libs/mongodb";
import User from "@/models/users";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { id } = await request.json();
  // console.log(id);
  await connectMongoDB();
  const user = await User.findById(id);
  return NextResponse.json(user, { status: 201 });
}
