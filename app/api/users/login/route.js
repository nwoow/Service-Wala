import connectMongoDB from "@/libs/mongodb";
import User from "@/models/users";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { phoneNumber, password } = await request.json();
  // console.log(phoneNumber, password)
  await connectMongoDB();
  const user = await User.findOne({phoneNumber}) 
  if (!user) {
    return NextResponse.json({ message: "Invalid phone number", status: 400 }, { status: 400 });
  }
  else if (user.password!== password) {
    return NextResponse.json({ message: "Invalid password", status: 400 }, { status: 400 });
  }
  else if (!user.active) {
    return NextResponse.json({ message: "Account is not active", status: 400 }, { status: 400 });
  }
  return NextResponse.json(user, { status: 201 });
}
