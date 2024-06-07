"use client";
import React from "react";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer.js";
import { WiStars } from "react-icons/wi";
import ServiceSection from "@/components/ServiceSection";

const About = () => {
  return (
    <div>
      <Nav />
      <div className="min-h-screen container mx-auto px-4 py-8 flex flex-col items-center justify-center bg-gray-100">
        <div className="max-w-full w-full bg-white shadow-md rounded-lg p-8 flex flex-col md:flex-row">
          <div className="md:w-1/2 md:pr-8">
            <h1 className="font-cookie text-blue-500 text-4xl sm:text-5xl md:text-6xl lg:text-6xl">
              About Us
            </h1>
            <h2 className="font-julius  text-gray-700 text-3xl sm:text-3xl md:text-4xl lg:text-3xl mb-4">
              Your Trusted Home Service Partner
            </h2>
            <p className="mb-4 text-gray-700">
              At Service Wallah, we understand the importance of a smoothly
              functioning home. With our range of expert services, we ensure
              that your home remains a haven of comfort and convenience.
            </p>
            <p className="mb-4 text-gray-700">
              From air conditioner repairs to fan installations, our skilled
              professionals are adept at handling a variety of household tasks,
              providing you with hassle-free solutions that you can rely on.
            </p>
            <h2 className="font-julius text-gray-700 text-3xl sm:text-3xl md:text-4xl lg:text-3xl mb-4">
              Services We Offer
            </h2>
            <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-700">
              <li>Air Conditioner Repair</li>
              <li>Fan Installation and Repair</li>
              <li>Electrical Services</li>
              <li>Plumbing Solutions</li>
              <li>Appliance Maintenance</li>
              <li>And much more!</li>
            </ul>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center relative">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-full shadow-lg z-10">
              <Image
                src="/image/slider5.webp"
                alt="A person working"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <div className="absolute top-24 left-8 w-64 h-64 hidden sm:w-80 sm:h-80 md:w-80 md:h-96 shadow-lg z-20">
              <Image
                src="/image/slider6.webp"
                alt="A person working"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
        <p className="mt-8 text-gray-600">
          Contact us today to experience the convenience and reliability of
          Service Wallah!
        </p>
      </div>
      <div className="w-full flex flex-col justify-center items-center py-4 px-4">
        <h1 className="font-julius text-center text-gray-700 text-3xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 flex">
          <WiStars color="orange" />
          How to book a service
          <WiStars color="orange" />
        </h1>
        <img
          className="w-64 sm:w-80 md:w-96 lg:w-96"
          src="/image/line2.svg"
          alt=""
        />
      </div>
      <div className="px-4 lg:px-20  w-full">
        <ServiceSection />
      </div>
      <section className="pb-12 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="w-full flex flex-col justify-center items-center py-4 px-4">
            <h1 className="font-julius text-center text-gray-700 text-3xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 flex">
              <WiStars color="orange" />
              Why choose us?
              <WiStars color="orange" />
            </h1>
            <img
              className="w-64 sm:w-80 md:w-96 lg:w-96"
              src="/image/line2.svg"
              alt=""
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">
                <img
                  src="/icons/shipping.svg"
                  alt="Fast & Free Shipping"
                  className="h-12 w-12"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Fast & Free Shipping
              </h3>
              <p>
                Amet minim mollit non deserunt ullamco est sit aliqua dolor do
                amet sint.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">
                <img
                  src="/icons/warranty.svg"
                  alt="Warranty Protection"
                  className="h-12 w-12"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Warranty Protection
              </h3>
              <p>
                Amet minim mollit non deserunt ullamco est sit aliqua dolor do
                amet sint velit.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">
                <img
                  src="/icons/materials.svg"
                  alt="Premium Materials"
                  className="h-12 w-12"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Materials</h3>
              <p>Amet minim mollit non deserunt ullamco est sit aliqu.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
