import connectMongoDB from "@/libs/mongodb";
import Service from "@/models/Service";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { subServiceId, id } = params;
  const { data } = await request.json();
  await connectMongoDB();

  // Update the subService directly in the database without fetching the whole document
  await Service.updateOne(
    { _id: id, "subServices._id": subServiceId },
    {
      $set: {
        "subServices.$.name": data.name,
        "subServices.$.status": data.status,
        "subServices.$.price": data.price,
        "subServices.$.icon": data.icon,
      },
    }
  );

  return NextResponse.json("Sub Services Updated Successfully", {
    status: 201,
  });
}

export async function DELETE(request, { params }) {
  const { subServiceId, id } = params;
  await connectMongoDB();

  await Service.findByIdAndUpdate(id, {
    $pull: {
      subServices: { _id: subServiceId },
    },
  });

  return NextResponse.json("Successfully Deleted the service", { status: 201 });
}
