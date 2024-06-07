"use client";
import React, { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Services from "@/components/Services";

const AllServices = () => {
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const gettingServices = async () => {
    try {
      const fetchedData = await fetch("/api/services", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await fetchedData.json();
      console.log(response);
      const filteredServices = response.filter(
        (service) => service.status === "active"
      );
      setAllServices(filteredServices);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    gettingServices();
  }, []);
  return (
    <>
      <div
        className={`grid place-items-center min-h-screen absolute w-full bg-white transition-all duration-700 top-0 ${
          loading ? "opacity-100" : "opacity-0"
        } ${loading ? "z-50" : "-z-50"}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="loaction-loader"></div>
          <div className="text-2xl font-julius">Loading</div>
        </div>
      </div>
      <div
        className={`${
          loading ? "hidden" : "bloack"
        } transition-all duration-700`}
      >
        <Nav />
        <div className="w-full flex flex-col justify-center items-center mt-8 px-4">
          <h1 className="font-julius lg:text-5xl md:text-4xl sm:text-3xl text-3xl text-center text-gray-700">
            FOR ALL YOUR NEEDS WE PROVIDES
          </h1>
          <h2 className="font-cookie w-full md:w-auto flex justify-center md:justify-start lg:text-6xl md:text-6xl sm:text-5xl text-5xl text-center text-blue-500 ">
            Best Services
          </h2>
        </div>
        <div className="container mx-auto lg:p-6 p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {allServices.map((service, index) => (
            <Services
              key={index}
              iconSrc={service.icon?.url}
              title={service.name}
              services={service.subServices}
              link={service._id}
              reviews={service.reviews}
            />
          ))}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AllServices;
