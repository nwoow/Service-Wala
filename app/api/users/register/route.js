import connectMongoDB from "@/libs/mongodb";
import User from "@/models/users";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { name, phoneNumber, email, password } = await request.json();
  // console.log(name, phoneNumber, email, password);
  await connectMongoDB();
  const user = await User.create({
    name,
    email,
    phoneNumber,
    gender: "Unspecified",
    location: "Unspecified",
    city: "Unspecified",
    active: true,
    role: "user",
    password,
    image: {
      url: "",
      name: "",
    },
  });
  return NextResponse.json(user, { status: 201 });
}
