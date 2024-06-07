"use client";
import Nav from "@/components/Nav";
import React, { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import HorizontalBarChart from "@/components/HorizontalBarChart";
import PieChart from "@/components/PieChart";

const Admin = () => {
  const [data, setData] = useState({
    totalServices: 0,
    inactiveServices: 0,
    activeServices: 0,
    totalSubServices: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalServiceProviders: 0,
    activeServiceproviders: 0,
  });
  const getDashboardData = async () => {
    const response = await fetch("/api/admin/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setData(data);
  };
  const chechingAuthorization = async () => {
    const id = localStorage.getItem("token");
    if (!id) {
      window.location.href = "/";
      return;
    }
    const response = await fetch(`/api/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.role !== "admin") {
      window.location.href = "/";
    }
  };
  const [loading, setLoading] = useState(true);
  const loadingFunction = async () => {
    await chechingAuthorization();
    await getDashboardData();
    setLoading(false);
  };
  useEffect(() => {
    loadingFunction();
  }, []);

  return (
    <>
      {loading ? (
        <div className="grid place-items-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="loaction-loader"></div>
            <div className="text-2xl font-julius">Loading</div>
          </div>
        </div>
      ) : (
        <div>
          <Nav />
          <div className="flex lg:flex-row flex-col h-full items-start gap-10 px-8 my-4">
            <div className="grid grid-cols-1 gap-6 self-start w-full">
              <DashboardCard data={data} />
            </div>
            <div className="w-full flex flex-col items-start gap-6">
              <div className="w-full h-full p-4 bg-white shadow-lg rounded-lg">
                <HorizontalBarChart data={data} />
              </div>
              <div className="w-full h-full p-4 bg-white shadow-lg rounded-lg">
                <PieChart data={data} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
