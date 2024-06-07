import connectMongoDB from "@/libs/mongodb";
import Service from "@/models/Service";
import User from "@/models/users";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();
  
  const users = await User.find();
  const totalServices = await Service.find();

  const totalServiceProviders = users.filter((e) => e.role === "service-provider");
  const activeServiceProviders = totalServiceProviders.filter((e) => e.active === true);
  const totalUsers = users.filter((e) => e.role === "user");
  const activeUsers = totalUsers.filter((e) => e.active === true);
  const activeServices = totalServices.filter((e) => e.status === "active");
  const inactiveServices = totalServices.filter((e) => e.status === "inActive");

  const totalSubservices = [];
  totalServices.forEach((service) => {
    if (service.subServices) {
      service.subServices.forEach((subservice) => {
        totalSubservices.push(subservice);
      });
    }
  });

  const data = {
    totalServices: totalServices.length,
    inactiveServices: inactiveServices.length,
    activeServices: activeServices.length,
    totalSubServices: totalSubservices.length,
    totalUsers: totalUsers.length,
    activeUsers: activeUsers.length,
    totalServiceProviders: totalServiceProviders.length,
    activeServiceProviders: activeServiceProviders.length,
  };

  return NextResponse.json(data, { status: 201 });
}
