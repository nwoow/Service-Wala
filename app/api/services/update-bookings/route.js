import connectMongoDB from "@/libs/mongodb";
import Service from "@/models/Service";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { cartItems, orderId } = await request.json();

  await connectMongoDB();
  Promise.all(
    cartItems.map(async (service) => {
      const id = service.serviceId;
      const res = await Service.findById(id);
      res.bookings.push({ orderId, subService: service });
      await res.save();
    })
  );

  return NextResponse.json("Bookings updated", { status: 201 });
}
