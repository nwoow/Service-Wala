import connectMongoDB from "@/libs/mongodb";
import User from "@/models/users";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();
  await connectMongoDB();
  const user = await User.findByIdAndUpdate(data._id, data);
  return NextResponse.json(user, { status: 201 });
}
export async function PUT(request) {
  const data = await request.json();
  await connectMongoDB();
  const user = await User.findOne({phoneNumber: data.phoneNumber});
  user.password = data.password;
  await user.save();
  return NextResponse.json(user, { status: 201 });
}
