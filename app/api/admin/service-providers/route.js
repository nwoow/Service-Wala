import connectMongoDB from "@/libs/mongodb";
import User from "@/models/users";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();
  const users = await User.find();
  const filteredUsers = users.filter((e, i) => {
    return e.role === "service-provider";
  });
  return NextResponse.json(filteredUsers, { status: 201 });
}

export async function POST(request) {
  const data = await request.json();
  // console.log(data);
  await connectMongoDB();
  await User.findByIdAndUpdate(data._id, data);
  return NextResponse.json("Service Provider Updated", { status: 201 });
}

export async function DELETE(request) {
  const data = await request.json();
  // console.log(data);
  await connectMongoDB();
  await User.findByIdAndDelete(data._id);
  return NextResponse.json("Service Provider Deleted", { status: 201 });
}
