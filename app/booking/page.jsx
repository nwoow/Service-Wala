"use client";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  IconButton,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { RxCross1 } from "react-icons/rx";

const Booking = () => {
  const checkingAuthorization = async () => {
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
    if (!data) {
      window.location.href = "/";
    }
  };

  useEffect(() => {
    checkingAuthorization();
  }, []);

  const [open, setOpen] = useState(false);
  const handleOpenDialog = () => setOpen(!open);

  const inputRefs = useRef([]);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    if (value.length >= 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !e.target.value) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const services = [
    { name: "AC Installation", price: 618, image: "/image/slider1.webp" },
    { name: "AC Maintenance", price: 450, image: "/image/slider2.webp" },
    { name: "AC Repair", price: 700, image: "/image/slider3.webp" },
    { name: "AC Cleaning", price: 300, image: "/image/slider4.webp" },
    { name: "AC Gas Refill", price: 520, image: "/image/slider5.webp" },
  ];

  return (
    <div className="userpage-bg min-h-screen">
      <Nav />
      {/* Users Booking Section */}
      {/* <div className="max-w-5xl bg-white bg-opacity-25 shadow-lg shadow-gray-400 backdrop-blur-sm backdrop-filter backdrop-opacity-1 rounded-lg border border-opacity-20 border-white mx-auto my-8 p-6">
  <header className="mb-8 flex flex-col sm:flex-row items-center justify-center mx-auto gap-2">
    <h1 className="font-julius text-center lg:text-4xl md:text-4xl sm:text-3xl text-3xl text-gray-700 font-bold">
      Booking Details
    </h1>
  </header>

  <section className="mb-8">
    <div className="flex items-center gap-3">
      <Image
        src="/image/hero5.webp"
        className="rounded-md"
        alt="Booking"
        width={96} // Adjust the width and height as needed
        height={96}
      />
      <h3 className="font-julius lg:text-3xl md:text-2xl sm:text-2xl text-3xl text-gray-700 font-bold">
        AC Installer
      </h3>
    </div>
    <div className="flex flex-col sm:flex-row justify-between mt-2">
      <div className="mb-4 sm:mb-0 leading-9">
        <p>
          Full Name: <strong className="text-gray-600">Atul Kumar</strong>
        </p>
        <p>
          Phone: <strong className="text-gray-600">+91 9508973152</strong>
        </p>
        <p>
          Address:{" "}
          <strong className="text-gray-600">
            Bashist colony anishabad patna-800002
          </strong>
        </p>
        <p>
          Booking #: <strong className="text-gray-600">0000011</strong>
        </p>
        <p>
          Booking Date:{" "}
          <strong className="text-gray-600">02-29-2024</strong>
        </p>
        <p className="text-gray-800 font-bold flex items-center gap-2">
          Status:{" "}
          <span className="text-teal-500 rounded-md">Confirmed</span>
        </p>
      </div>
      <div className="leading-9">
        <p>
          Available Date:{" "}
          <strong className="text-gray-600">
            Sunday 11. August, 2024
          </strong>
        </p>
        <p>
          Timing: <strong className="text-gray-600">10:00 AM</strong>
        </p>
        <p>
          Quantity: <strong className="text-gray-600">1</strong>
        </p>
        <p className="text-gray-800 font-bold flex items-center gap-2">
          Verification OTP: <span className="text-teal-500">1234</span>
        </p>
      </div>
    </div>
  </section>

  <section className="mb-8">
    <table className="min-w-full  ">
      <thead>
        <tr>
          <th className="py-2 px-4   text-left font-julius lg:text-2xl md:text-xl sm:text-xl text-xl text-gray-700 font-bold">
            Summary
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-2 px-4 border-b">Subtotal</td>
          <td className="py-2 px-4 border-b text-right">₹600.00</td>
        </tr>
        <tr>
          <td className="py-2 px-4 border-b">Convenience Fee</td>
          <td className="py-2 px-4 border-b text-right">₹18.00</td>
        </tr>
        <tr>
          <td className="py-2 px-4 font-bold">Total</td>
          <td className="py-2 px-4 text-right font-bold">₹618.00</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section className="mb-8">
    <p className="font-medium text-red-600">
      Note: Order can be cancelled up to 10 minutes before the scheduled
      time.
    </p>
    <div className="flex justify-end">
      <button className="mt-4 bg-red-600 text-white py-2 px-4 rounded">
        Cancel Order
      </button>
    </div>
  </section>
</div>     */}

      {/* Service provider Booking Section */}
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg w-full  p-4 max-w-md mx-auto my-4"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={service.image}
                    alt={service.name}
                  />
                </div>
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {service.name}
                  </h2>
                  <p className="text-lg font-bold text-teal-600">
                    ${service.price}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                    Reject
                  </button>
                  <button className="px-4 py-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                    Accept
                  </button>
                </div>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  onClick={handleOpenDialog}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={open}
        handler={handleOpenDialog}
        dismiss={{ enabled: false }}
        size="xl"
        className="bg-gray-100 p-6"
      >
        <DialogHeader className="flex justify-between items-center">
          <div className="font-julius text-2xl font-bold">Booking Details</div>
          <IconButton variant="text" onClick={handleOpenDialog}>
            <RxCross1 size={20} />
          </IconButton>
        </DialogHeader>
        <DialogBody divider className="max-h-96 overflow-auto">
          <div className="">
            <section className="mb-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/image/hero5.webp"
                  className="rounded-md"
                  alt="Booking"
                  width={96}
                  height={96}
                />
                <h3 className="font-julius lg:text-3xl md:text-2xl sm:text-2xl text-3xl text-gray-700 font-bold">
                  AC Installer
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row justify-between mt-2">
                <div className="mb-4 mt-2 sm:mb-0 leading-9">
                  <h3 className="font-bold text-gray-700 text-xl">
                    Customer Information
                  </h3>
                  <p>
                    Full Name:{" "}
                    <strong className="text-gray-600">Atul Kumar</strong>
                  </p>
                  <p>
                    Phone:{" "}
                    <strong className="text-gray-600">+91 9508973152</strong>
                  </p>
                  <p>
                    Address:{" "}
                    <strong className="text-gray-600">
                      Bashist colony anishabad patna-800002
                    </strong>
                  </p>
                  <p>
                    Booking #:{" "}
                    <strong className="text-gray-600">0000011</strong>
                  </p>
                  <p>
                    Booking Date:{" "}
                    <strong className="text-gray-600">02-29-2024</strong>
                  </p>
                </div>
                <div className="leading-9 lg:mt-8 md:mt-8 sm:mt-8 mt-0">
                  <p>
                    Date:{" "}
                    <strong className="text-gray-600">
                      Sunday 11. August, 2024
                    </strong>
                  </p>
                  <p>
                    Timing: <strong className="text-gray-600">10:00 AM</strong>
                  </p>
                  <p>
                    Quantity: <strong className="text-gray-600">1</strong>
                  </p>
                  <p className="text-gray-800 font-bold flex items-center gap-2">
                    Status:{" "}
                    <span className="text-teal-500 rounded-md">Confirmed</span>
                  </p>
                </div>
              </div>
            </section>
            <section className="mb-8">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left font-julius lg:text-2xl md:text-xl sm:text-xl text-xl text-gray-700 font-bold">
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 border-b">Subtotal</td>
                    <td className="py-2 px-4 border-b text-right">₹600.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Convenience Fee</td>
                    <td className="py-2 px-4 border-b text-right">₹18.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-bold">Total</td>
                    <td className="py-2 px-4 text-right font-bold">₹618.00</td>
                  </tr>
                </tbody>
              </table>
            </section>
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="bg-gray-50 p-6 rounded-lg shadow-md lg:w-full md:w-10/12 sm:w-10/12 w-full">
                <h2 className="py-2 px-4 text-center font-julius lg:text-2xl md:text-xl sm:text-xl text-lg text-gray-700 font-bold">
                  Verification Code
                </h2>
                <div className="flex justify-center space-x-2 mb-4">
                  {[0, 1, 2, 3].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl sm:w-12 sm:h-12"
                      onChange={(e) => handleInputChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      ref={(el) => (inputRefs.current[index] = el)}
                    />
                  ))}
                </div>
                <button className="p-3 bg-orange-500 text-white rounded-lg w-full hover:bg-orange-600">
                  Confirm
                </button>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-md lg:w-full md:w-10/12 sm:w-10/12 w-full">
                <div>
                  <h2 className="py-2 px-4 text-center font-julius lg:text-2xl md:text-xl sm:text-xl text-lg text-gray-700 font-bold">
                    Upload Image
                  </h2>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block mx-auto mb-4"
                  />
                  {uploadedImage && (
                    <div className="flex justify-center">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-32 h-32 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <section className="mb-8 mt-4">
              <h3 className="text-xl font-bold text-red-600">Caution:</h3>
              <ol className="list-decimal ml-6 mt-2 text-gray-700">
                <li>Accept the booking as soon as possible.</li>
                <li>Rejection cannot be undone later.</li>
                <li>Verify OTP from the customer.</li>
                <li>Attach an image with the serving product.</li>
              </ol>
            </section>
            <div className="mt-4 flex justify-end">
              <div className="flex gap-2 ">
                <button className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                  Reject
                </button>
                <button className="px-4 py-2  bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                  Accept
                </button>
              </div>
            </div>
          </div>
        </DialogBody>
      </Dialog>
      <Footer />
    </div>
  );
};

export default Booking;
