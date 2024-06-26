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
  Tooltip,
  Input,
  Button,
} from "@material-tailwind/react";
import { GrStatusInfo } from "react-icons/gr";
import { RxCross1, RxCross2 } from "react-icons/rx";
import { Drawer, Typography } from "@material-tailwind/react";
import { FaEye, FaPhone } from "react-icons/fa6";
import { IoMdMailOpen, IoMdOpen } from "react-icons/io";
import {
  FaAngleDoubleRight,
  FaBookmark,
  FaCheckCircle,
  FaRegSadCry,
  FaRegStar,
} from "react-icons/fa";
import { Rating } from "@material-tailwind/react";
import { PiGenderIntersexFill } from "react-icons/pi";
import axios from "axios";
import {
  GoogleMap,
  LoadScript,
  Marker,
  LoadScriptNext,
} from "@react-google-maps/api";
import { MdOutlineCloudUpload, MdVerified } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/firebase";
import Link from "next/link";
import { Player } from "@lottiefiles/react-lottie-player";

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

  const mapContainerStyle = {
    width: "100%",
    height: "60vh",
  };

  const [open, setOpen] = useState(false);
  const handleOpenDialog = () => setOpen(!open);

  const [open1, setOpen1] = useState(false);

  const openDrawer = () => setOpen1(true);
  const closeDrawer = () => setOpen1(false);

  const [user, setUser] = useState({});

  const gettingUser = async () => {
    try {
      const id = localStorage.getItem("token");
      const response = await axios.get(`/api/users/${id}`);
      const data = response.data;
      setUser(data);
    } catch (err) {
      console.log(err);
    }
  };
  const [serviceProviderBookings, setServiceProviderBookings] = useState([]);
  const gettingServiceProviderBookings = async () => {
    try {
      const response = await axios.post(
        `/api/bookings/bookings-from-array-of-id`,
        user?.bookings
      );
      const data = response.data;
      // console.log(data);
      const filteredData = data.filter((booking) => booking.completed !== true);
      setServiceProviderBookings(filteredData);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    gettingUser();
  }, []);
  useEffect(() => {
    if (user?.bookings?.length > 0) {
      gettingServiceProviderBookings();
    }
  }, [user]);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleViewClick = (booking) => {
    setSelectedBooking(booking);
    handleOpenDialog();
  };

  useEffect(() => {
    console.log(selectedBooking);
  }, [selectedBooking]);

  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleChangeOtp = (element, index) => {
    if (isNaN(element.value)) return false;

    let newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to the next input box if the current one is filled
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifyingError, setOtpVerifyingError] = useState("");
  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue != selectedBooking.otp) {
      setOtpVerifyingError("Invalid otp");
      return;
    }
    setOtpVerified(true);
    setOtp(["", "", "", ""]);
    const postData = { ...selectedBooking, otpVerified: true };
    const res = await axios.put(
      `/api/bookings/${selectedBooking._id}`,
      postData
    );
    console.log(res);
  };

  const [uploadedImage, setUploadedImage] = useState("");
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (selectedBooking?.verificationImage?.url) {
      await deleteObject(ref(storage, selectedBooking?.verificationImage?.url));
    }
    const imageRef = ref(
      storage,
      `service-provider-verification-image/${
        file.lastModified + file.size + file.name
      }`
    );
    await uploadBytes(imageRef, file);
    const imageUrl = await getDownloadURL(imageRef); // Get the image URL directly
    setUploadedImage(imageUrl);
    const imageObject = { url: imageUrl, name: imageRef._location.path_ };
    const postData = {
      ...selectedBooking,
      verificationImage: imageObject,
    };
    const res = await axios.put(
      `/api/bookings/${selectedBooking._id}`,
      postData
    );
    console.log(res);
  };
  useEffect(() => {
    if (selectedBooking?.otpVerified === true) {
      setOtpVerified(true);
    }
    if (selectedBooking?.otpVerified !== true) {
      setOtpVerified(false);
    }
    if (selectedBooking?.verificationImage?.url) {
      setUploadedImage(selectedBooking?.verificationImage?.url);
    }
    setOtpVerifyingError("");
  }, [selectedBooking]);

  const handleRejectRequest = async (id) => {
    try {
      // Filter out the rejected booking from user's bookings
      const filteredBookings = user.bookings?.filter(
        (bookingId) => bookingId !== id
      );
      const updateServiceProviderData = {
        ...user,
        bookings: filteredBookings,
      };

      // Update the user data to remove the rejected booking
      const existingServiceProviderResponse = await axios.post(
        `/api/users/update`,
        updateServiceProviderData
      );
      console.log({ existingServiceProviderResponse });

      // Get the current booking data
      const selectedBookingResponse = await axios.get(`/api/bookings/${id}`);
      const selectedBooking = selectedBookingResponse.data;

      // Filter out the current service provider from available service providers
      const filteredAvailableServiceProviders =
        selectedBooking.availableServiceProviders.filter(
          (sp) => sp._id !== user._id
        );

      // Update booking data to remove the current service provider
      const bookingData = {
        ...selectedBooking,
        availableServiceProviders: filteredAvailableServiceProviders,
      };

      // If there's no next service provider available
      if (filteredAvailableServiceProviders.length === 0) {
        const updateNoServiceProviderAvailableData = {
          ...bookingData,
          noServiceProviderAvailable: true,
        };

        // Mark booking as no service provider available
        const updateBookingResponse = await axios.put(
          `/api/bookings/${id}`,
          updateNoServiceProviderAvailableData
        );
        console.log({ updateBookingResponse });
        window.location.reload();
        return;
      }

      // Get the index of current service provider
      const currentIndexOfAvailableServiceProvider =
        selectedBooking.availableServiceProviders.findIndex(
          (sp) => sp._id === user._id
        );

      // Get the next service provider
      const nextServiceProvider =
        selectedBooking.availableServiceProviders[
          currentIndexOfAvailableServiceProvider + 1
        ];

      // Update bookings for the next service provider
      const nextServiceProviderData = {
        ...nextServiceProvider,
        bookings: [...nextServiceProvider.bookings, selectedBooking._id],
      };

      // Update next service provider's bookings
      const nextServiceProviderResponse = await axios.post(
        `/api/users/update`,
        nextServiceProviderData
      );
      console.log({ nextServiceProviderResponse });

      // Update booking data with the updated available service providers
      const updateBookingResponse = await axios.put(
        `/api/bookings/${id}`,
        bookingData
      );
      console.log({ updateBookingResponse });

      // Reload page after all updates
      window.location.reload();
    } catch (err) {
      console.log("Error occurred:", err);
    }
  };

  const handleAcceptRequest = async (id) => {
    const postData = {
      ...selectedBooking,
      acceptedByServiceProvider: true,
      assignedServiceProviders: user,
    };
    try {
      const response = await axios.put(`/api/bookings/${id}`, postData);
      console.log(response);
      if (response.status === 201) {
        setSelectedBooking(postData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Users currently bookings dialog handling
  const [openUserBookingDialog, setOpenUserBookingDialog] = useState(false);
  const handleOpenUserBookingDialog = () =>
    setOpenUserBookingDialog(!openUserBookingDialog);
  const [selectedUserBooking, setSelectedUserBooking] = useState({
    cartItems: [],
    otp: "",
  });

  // Users expired bookings dialog handling
  const [openUserBookingexpiredDialog, setOpenUserBookingexpiredDialog] =
    useState(false);
  const handleOpenUserBookingexpiredDialog = () =>
    setOpenUserBookingexpiredDialog(!openUserBookingexpiredDialog);
  const [selectedUserexpiredBooking, setSelectedUserexpiredBooking] = useState({
    cartItems: [],
    otp: "",
  });

  // Users completed bookings dialog handling
  const [openUserBookingCompletedDialog, setOpenUserBookingCompletedDialog] =
    useState(false);
  const handleOpenUserBookingCompletedDialog = () =>
    setOpenUserBookingCompletedDialog(!openUserBookingCompletedDialog);
  const [selectedUserCompletedBooking, setSelectedUserCompletedBooking] =
    useState({
      cartItems: [],
      otp: "",
    });

  const [userBookings, setUserBookings] = useState([]);
  const [
    userNoServiceProviderAvailableBookings,
    setUserNoServiceProviderAvailableBookings,
  ] = useState([]);
  const [userCompletedBookings, setUserCompletedBookings] = useState([]);

  const getUserBookings = async () => {
    try {
      const response = await axios.post(
        `/api/bookings/bookings-from-array-of-id`,
        user?.bookings
      );
      const data = response.data;
      console.log(data);

      const incompleteBookings = data.filter(
        (booking) => !booking.completed && !booking.noServiceProviderAvailable
      );

      const completedBookings = data.filter((booking) => booking.completed);

      const noServiceProviderAvailableBookings = data.filter(
        (booking) => booking.noServiceProviderAvailable
      );

      setUserBookings(incompleteBookings);
      setUserCompletedBookings(completedBookings);
      setUserNoServiceProviderAvailableBookings(
        noServiceProviderAvailableBookings
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.bookings) {
      getUserBookings();
    }
  }, [user?.bookings]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="w-full">
        <Nav />
      </div>
      <Drawer
        open={open1}
        size={330}
        overlay={false}
        dismiss={{ enabled: false }}
        onClose={closeDrawer}
        className="p-4"
      >
        <div className="mb-6 flex items-center justify-between">
          <Typography variant="h5" color="blue-gray">
            Summary
          </Typography>

          <IconButton variant="text" color="blue-gray" onClick={closeDrawer}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>
        <div className="mb-4 flex flex-col   border-b border-blue-gray-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="">
              <Image
                src="/image/hero5.webp"
                className="rounded-full h-12 w-12"
                alt="Booking"
                width={96}
                height={96}
              />
            </div>
            <div className="">
              <Typography variant="h5" color="blue" className="font-semibold">
                Kundan Kumar
              </Typography>
              <div className="text-gray-800 flex items-center gap-2 mx-auto  font-bold">
                <Rating value={4} readonly /> 4.5
              </div>
            </div>
          </div>
        </div>
        <div
          color="gray"
          className="mb-8 flex flex-col gap-3 items-start pr-4 font-normal"
        >
          <div className="flex items-center gap-3">
            <FaPhone className="text-teal-500" size={23} />
            Phone: +91 9508973152
          </div>
          <div className="flex items-center gap-3">
            <IoMdMailOpen className="text-deep-purple-500" size={23} />
            Email: atul.kumar@example.com
          </div>
          <div className="flex items-center gap-3">
            <PiGenderIntersexFill className="text-blue-500" size={23} />
            Gender: Male
          </div>
          <div className="flex items-center gap-3">
            <FaBookmark className="text-amber-500" size={23} />
            Booked Over: 5 times
          </div>
        </div>
      </Drawer>
      {user?.role === "user" ? (
        <div>
          {userBookings.length > 0 && (
            <div className="px-10 my-10">
              <h2 className="text-2xl text-blue-500 font-semibold">
                Your on going service requests!
              </h2>
              <div className="h-px bg-gray-300 w-full my-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
                {userBookings.map((service, index) => {
                  return (
                    <div
                      key={index}
                      className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col justify-between"
                    >
                      <div className="p-4 flex gap-4 flex-col">
                        {service.cartItems.map((item, itemIndex) => (
                          <div className="flex flex-col gap-2" key={item._id}>
                            <div
                              key={itemIndex}
                              className={`flex items-center space-x-2`}
                            >
                              <div className="flex-shrink-0">
                                <img
                                  className="w-16 h-16 rounded-full object-cover"
                                  src={item.icon?.url}
                                  alt={item.name}
                                />
                              </div>
                              <div className="flex-grow">
                                <h2 className="text-lg font-semibold text-gray-800">
                                  {item.name}
                                </h2>
                                <div className="flex items-center justify-between gap-4 mt-1">
                                  <p className="text-lg font-bold text-teal-600">
                                    ₹{item.price}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {itemIndex < service.cartItems.length - 1 ? (
                              <div className="h-px bg-gray-300 w-full"></div>
                            ) : (
                              ""
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium transition-all hover:bg-blue-600 flex items-center gap-2 justify-center"
                        onClick={() => {
                          setSelectedUserBooking(service);
                          handleOpenUserBookingDialog();
                        }}
                      >
                        View
                        <IoMdOpen />
                      </button>
                    </div>
                  );
                })}
                <Dialog
                  open={openUserBookingDialog}
                  handler={handleOpenUserBookingDialog}
                  // dismiss={{ enabled: false }}
                  size="lg"
                  animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.1, y: 500 },
                  }}
                >
                  {selectedUserBooking?.acceptedByServiceProvider ? (
                    <div
                      key={selectedUserBooking._id}
                      className="container overflow-auto bg-white rounded-lg p-6 h-[36rem]"
                    >
                      <header className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <h1 className="text-center text-3xl text-gray-700">
                          Booking Details
                        </h1>
                        <IconButton
                          variant="text"
                          onClick={handleOpenUserBookingDialog}
                        >
                          <RxCross2 size={25} />
                        </IconButton>
                      </header>
                      <div className="h-px bg-gray-300 w-full my-4"></div>
                      <section>
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                          {selectedUserBooking?.cartItems?.map((item) => {
                            return (
                              <div
                                className="flex items-center gap-3"
                                key={item._id}
                              >
                                <img
                                  src={item.icon?.url}
                                  className="rounded-md w-28 h-28 object-cover"
                                  alt="Booking"
                                />
                                <div className="flex flex-col gap-1">
                                  <h3 className="md:text-2xl sm:text-2xl text-xl text-gray-700 ">
                                    {item.name}
                                  </h3>
                                  <p>
                                    Price:{" "}
                                    <strong className="text-teal-500 font-semibold">
                                      ₹{item.price}
                                    </strong>
                                  </p>
                                  <p>
                                    Qty:{" "}
                                    <strong className="text-gray-600">
                                      {item.quantity}
                                    </strong>
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <h4 className="text-blue-500 font-semibold text-xl mt-4">
                          Your Information
                        </h4>
                        <div className="h-px bg-gray-300 w-full mt-2 mb-1"></div>
                        <div className="flex flex-col justify-between gap-4">
                          <div>
                            Full Name:{" "}
                            <strong className="text-gray-600">
                              {selectedUserBooking?.fullname}
                            </strong>
                          </div>
                          <div>
                            Phone:{" "}
                            <strong className="text-gray-600">
                              +91 {selectedUserBooking?.phoneNumber}
                            </strong>
                          </div>
                          <div>
                            Address:{" "}
                            <strong className="text-gray-600">
                              {selectedUserBooking?.address}
                            </strong>
                          </div>
                          <div>
                            Booking Date:{" "}
                            <strong className="text-gray-600">
                              {selectedUserBooking?.date}
                            </strong>
                          </div>
                          <div className="text-gray-800 font-bold flex items-center gap-2">
                            Status:{" "}
                            <span className="text-teal-500 rounded-md">
                              {selectedUserBooking?.status}
                            </span>
                          </div>
                          <div className="text-gray-800 font-bold flex items-center gap-2">
                            About Service Provider:{" "}
                            <span className="text-teal-500 rounded-md">
                              {
                                selectedUserBooking?.assignedServiceProviders
                                  ?.name
                              }
                            </span>
                            <div
                              onClick={openDrawer}
                              className="flex gap-2 cursor-pointer underline items-center "
                            >
                              View Detail <FaEye fontSize={20} />
                            </div>
                          </div>
                          <div className="h-px bg-gray-300 w-full"></div>
                          <div>
                            Day of departure:{" "}
                            <strong className="text-gray-600">
                              {selectedUserBooking?.date}
                            </strong>
                          </div>
                          <div>
                            Time of departure:{" "}
                            <strong className="text-gray-600">
                              {selectedUserBooking?.time}
                            </strong>
                          </div>
                          <div>
                            Quantity:{" "}
                            <strong className="text-gray-600">1</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-2 flex-col">
                              <div className="text-gray-800 font-bold flex gap-2 items-center">
                                Verification OTP:{" "}
                                <span className="flex items-center gap-2">
                                  {selectedUserBooking.otp
                                    .split("")
                                    .map((code) => {
                                      return (
                                        <span className="w-10 h-10 flex items-center justify-center text-lg rounded-md bg-gray-700 text-white">
                                          {code}
                                        </span>
                                      );
                                    })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Verification code is used to verify the service
                                provider when they reached to you!
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>
                      <section className="my-4">
                        <table className="min-w-full  ">
                          <thead>
                            <tr>
                              <th className="text-left text-2xl text-gray-700 font-normal">
                                Summary
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-2 px-4 border-b">Subtotal</td>
                              <td className="py-2 px-4 border-b text-right">
                                ₹
                                {selectedUserBooking?.cartItems
                                  ? new Intl.NumberFormat("en-IN", {
                                      style: "currency",
                                      currency: "INR",
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                      .format(
                                        selectedUserBooking?.cartItems.reduce(
                                          (acc, cur) =>
                                            acc + cur.price * cur.quantity,
                                          0
                                        )
                                      )
                                      .replace("₹", "")
                                      .trim()
                                  : "0.00"}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 border-b">
                                Convenience Fee
                              </td>
                              <td className="py-2 px-4 border-b text-right">
                                ₹18.00
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-4 font-bold">Total</td>
                              <td className="py-2 px-4 text-right font-bold">
                                ₹
                                {selectedUserBooking?.cartItems
                                  ? new Intl.NumberFormat("en-IN", {
                                      style: "currency",
                                      currency: "INR",
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                      .format(
                                        selectedUserBooking?.cartItems.reduce(
                                          (acc, cur) =>
                                            acc + cur.price * cur.quantity,
                                          18
                                        )
                                      )
                                      .replace("₹", "")
                                      .trim()
                                  : "0.00"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </section>
                      <section className="flex justify-between items-center">
                        <p className="font-medium text-red-600">
                          Note: Order can be cancelled up to 10 minutes before
                          the scheduled time.
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            className="rounded"
                            variant="outlined"
                            color="red"
                            onClick={handleOpenUserBookingDialog}
                          >
                            Cancel Order
                          </Button>
                          <Button
                            variant="gradient"
                            color="blue"
                            className="rounded"
                            onClick={handleOpenUserBookingDialog}
                          >
                            Close Dialog
                          </Button>
                        </div>
                      </section>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-300 rounded-2xl">
                      <header className="flex items-center justify-between gap-2 mb-2">
                        <h1 className="text-center text-2xl text-gray-700">
                          Booking Details
                        </h1>
                        <IconButton
                          variant="text"
                          onClick={handleOpenUserBookingDialog}
                        >
                          <RxCross2 size={25} />
                        </IconButton>
                      </header>
                      <div className="flex flex-col lg:flex-row justify-between items-center overflow-auto max-h-[32rem]">
                        <div className="w-full">
                          <div>
                            <Player
                              autoplay
                              loop
                              keepLastFrame={true}
                              src="/lottie/searching.json"
                            ></Player>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-lg">
                          <div className="flex gap-2 flex-col lg-flex-row items-center">
                            <div className="flex items-center gap-1">
                              <GrStatusInfo />
                              Booking Status:
                            </div>
                            <div className="text-gray-700 font-semibold text-center">
                              {selectedUserBooking?.status}
                            </div>
                          </div>
                          <div className="flex gap-4 flex-col">
                            {selectedUserBooking.cartItems.map(
                              (item, itemIndex) => (
                                <div
                                  className="flex flex-col gap-2"
                                  key={item._id}
                                >
                                  <div
                                    key={itemIndex}
                                    className={`flex items-center space-x-2`}
                                  >
                                    <div className="flex-shrink-0">
                                      <img
                                        className="w-16 h-16 rounded-full object-cover"
                                        src={item.icon?.url}
                                        alt={item.name}
                                      />
                                    </div>
                                    <div className="flex-grow">
                                      <h2 className="text-lg text-gray-800">
                                        {item.name}
                                      </h2>
                                      <div className="flex items-center justify-between gap-4">
                                        <p className="text-lg font-bold text-teal-600">
                                          ₹{item.price}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          Qty: {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  {itemIndex <
                                  selectedUserBooking.cartItems.length - 1 ? (
                                    <div className="h-px bg-gray-300 w-full"></div>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              )
                            )}
                          </div>
                          <Button
                            variant="gradient"
                            color="red"
                            className="rounded"
                            onClick={() => {
                              setSelectedUserBooking(service);
                              handleOpenUserBookingDialog();
                            }}
                          >
                            Cancel booking
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Dialog>
              </div>
            </div>
          )}
          {userNoServiceProviderAvailableBookings.length > 0 && (
            <div className="px-10 my-10">
              <h2 className="text-2xl text-red-500 font-semibold">
                Expired Services!
              </h2>
              <div className="h-px bg-gray-300 w-full my-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {userNoServiceProviderAvailableBookings.map(
                  (service, index) => {
                    return (
                      <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col justify-between"
                      >
                        <div className="p-4 flex gap-4 flex-col">
                          {service.cartItems.map((item, itemIndex) => (
                            <div className="flex flex-col gap-2" key={item._id}>
                              <div
                                key={itemIndex}
                                className={`flex items-center space-x-2`}
                              >
                                <div className="flex-shrink-0">
                                  <img
                                    className="w-16 h-16 rounded-full object-cover"
                                    src={item.icon?.url}
                                    alt={item.name}
                                  />
                                </div>
                                <div className="flex-grow">
                                  <h2 className="text-lg font-semibold text-gray-800">
                                    {item.name}
                                  </h2>
                                  <div className="flex items-center justify-between gap-4 mt-1">
                                    <p className="text-lg font-bold text-teal-600">
                                      ₹{item.price}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {itemIndex < service.cartItems.length - 1 ? (
                                <div className="h-px bg-gray-300 w-full"></div>
                              ) : (
                                ""
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          className="px-4 py-2 bg-gray-500 text-white text-sm font-medium transition-all hover:bg-gray-600 flex items-center gap-2 justify-center"
                          onClick={() => {
                            setSelectedUserexpiredBooking(service);
                            handleOpenUserBookingexpiredDialog();
                          }}
                        >
                          View <IoMdOpen />
                        </button>
                      </div>
                    );
                  }
                )}
                <Dialog
                  open={openUserBookingexpiredDialog}
                  handler={handleOpenUserBookingexpiredDialog}
                  // dismiss={{ enabled: false }}
                  size="sm"
                  className="p-6"
                  animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.1, y: 500 },
                  }}
                >
                  <header className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <h1 className="text-center text-xl text-gray-700">
                      Booking Details
                    </h1>
                    <IconButton
                      variant="text"
                      onClick={handleOpenUserBookingexpiredDialog}
                    >
                      <RxCross2 size={25} />
                    </IconButton>
                  </header>

                  <Player
                    autoplay
                    loop
                    keepLastFrame={true}
                    src="/lottie/expired-service-request.json"
                  ></Player>

                  <div className="flex flex-col items-center">
                    <div className="text-xl text-blue-500 font-semibold">
                      We are sorry for inconvenience
                    </div>
                    <div>Your booking got no service provider!</div>
                  </div>
                  <div className="flex items-center gap-4 w-full mt-4">
                    <Link href={"/location"} className="w-full">
                      <Button
                        variant="outlined"
                        color="blue"
                        className="rounded"
                        fullWidth
                      >
                        Location
                      </Button>
                    </Link>
                    <Link href={"/services"} className="w-full">
                      <Button
                        variant="gradient"
                        color="blue"
                        className="rounded"
                        fullWidth
                      >
                        Services
                      </Button>
                    </Link>
                  </div>
                </Dialog>
              </div>
            </div>
          )}
          {userCompletedBookings.length > 0 && (
            <div className="px-10 my-10">
              <h2 className="text-2xl text-teal-500 font-semibold">
                Service History!
              </h2>
              <div className="h-px bg-gray-300 w-full my-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {userCompletedBookings.map((service, index) => {
                  return (
                    <div
                      key={index}
                      className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col justify-between"
                    >
                      <div className="p-4 flex gap-4 flex-col">
                        {service.cartItems.map((item, itemIndex) => (
                          <div className="flex flex-col gap-2" key={item._id}>
                            <div
                              key={itemIndex}
                              className={`flex items-center space-x-2`}
                            >
                              <div className="flex-shrink-0">
                                <img
                                  className="w-16 h-16 rounded-full object-cover"
                                  src={item.icon?.url}
                                  alt={item.name}
                                />
                              </div>
                              <div className="flex-grow">
                                <h2 className="text-lg font-semibold text-gray-800">
                                  {item.name}
                                </h2>
                                <div className="flex items-center justify-between gap-4 mt-1">
                                  <p className="text-lg font-bold text-teal-600">
                                    ₹{item.price}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {itemIndex < service.cartItems.length - 1 ? (
                              <div className="h-px bg-gray-300 w-full"></div>
                            ) : (
                              ""
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        className="px-4 py-2 bg-gray-500 text-white text-sm font-medium transition-all hover:bg-gray-600 flex items-center gap-2 justify-center"
                        onClick={() => {
                          setSelectedUserCompletedBooking(service);
                          handleOpenUserBookingCompletedDialog();
                        }}
                      >
                        View <IoMdOpen />
                      </button>
                    </div>
                  );
                })}
                <Dialog
                  open={openUserBookingCompletedDialog}
                  handler={handleOpenUserBookingCompletedDialog}
                  // dismiss={{ enabled: false }}
                  size="xl"
                  // className="p-6"
                  animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.1, y: 500 },
                  }}
                >
                  <div
                    key={selectedUserCompletedBooking._id}
                    className="container overflow-auto bg-white rounded-lg p-6 h-[36rem]"
                  >
                    <header className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <h1 className="text-center text-3xl text-gray-700">
                        Booking Details
                      </h1>
                      <IconButton
                        variant="text"
                        onClick={handleOpenUserBookingCompletedDialog}
                      >
                        <RxCross2 size={25} />
                      </IconButton>
                    </header>
                    <div className="h-px bg-gray-300 w-full my-4"></div>
                    <section>
                      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                        {selectedUserCompletedBooking?.cartItems?.map(
                          (item) => {
                            return (
                              <div
                                className="flex items-center gap-3"
                                key={item._id}
                              >
                                <img
                                  src={item.icon?.url}
                                  className="rounded-md w-28 h-28 object-cover"
                                  alt="Booking"
                                />
                                <div className="flex flex-col gap-1">
                                  <h3 className="md:text-2xl sm:text-2xl text-xl text-gray-700 ">
                                    {item.name}
                                  </h3>
                                  <p>
                                    Price:{" "}
                                    <strong className="text-teal-500 font-semibold">
                                      ₹{item.price}
                                    </strong>
                                  </p>
                                  <p>
                                    Qty:{" "}
                                    <strong className="text-gray-600">
                                      {item.quantity}
                                    </strong>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                      <h4 className="text-blue-500 font-semibold text-xl mt-4">
                        Your Information
                      </h4>
                      <div className="h-px bg-gray-300 w-full mt-2 mb-1"></div>
                      <div className="flex flex-col justify-between gap-4">
                        <div>
                          Full Name:{" "}
                          <strong className="text-gray-600">
                            {selectedUserCompletedBooking?.fullname}
                          </strong>
                        </div>
                        <div>
                          Phone:{" "}
                          <strong className="text-gray-600">
                            +91 {selectedUserCompletedBooking?.phoneNumber}
                          </strong>
                        </div>
                        <div>
                          Address:{" "}
                          <strong className="text-gray-600">
                            {selectedUserCompletedBooking?.address}
                          </strong>
                        </div>
                        <div>
                          Booking Date:{" "}
                          <strong className="text-gray-600">
                            {selectedUserCompletedBooking?.date}
                          </strong>
                        </div>
                        <div className="text-gray-800 font-bold flex items-center gap-2">
                          Status:{" "}
                          <span className="text-teal-500 rounded-md">
                            {selectedUserCompletedBooking?.status}
                          </span>
                        </div>
                        <div className="text-gray-800 font-bold flex items-center gap-2">
                          About Service Provider:{" "}
                          <span className="text-teal-500 rounded-md">
                            {
                              selectedUserCompletedBooking
                                ?.assignedServiceProviders?.name
                            }
                          </span>
                          <div
                            onClick={openDrawer}
                            className="flex gap-2 cursor-pointer underline items-center "
                          >
                            View Detail <FaEye fontSize={20} />
                          </div>
                        </div>
                        <div className="h-px bg-gray-300 w-full"></div>
                        <div>
                          Day of departure:{" "}
                          <strong className="text-gray-600">
                            {selectedUserCompletedBooking?.date}
                          </strong>
                        </div>
                        <div>
                          Time of departure:{" "}
                          <strong className="text-gray-600">
                            {selectedUserCompletedBooking?.time}
                          </strong>
                        </div>
                        <div>
                          Quantity: <strong className="text-gray-600">1</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-2 flex-col">
                            <div className="text-gray-800 font-bold flex gap-2 items-center">
                              Verification OTP:{" "}
                              <span className="flex items-center gap-2">
                                {selectedUserCompletedBooking.otp
                                  .split("")
                                  .map((code) => {
                                    return (
                                      <span className="w-10 h-10 flex items-center justify-center text-lg rounded-md bg-gray-700 text-white">
                                        {code}
                                      </span>
                                    );
                                  })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Verification code is used to verify the service
                              provider when they reached to you!
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                    <section className="my-4">
                      <table className="min-w-full  ">
                        <thead>
                          <tr>
                            <th className="text-left text-2xl text-gray-700 font-normal">
                              Summary
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-2 px-4 border-b">Subtotal</td>
                            <td className="py-2 px-4 border-b text-right">
                              ₹
                              {selectedUserCompletedBooking?.cartItems
                                ? new Intl.NumberFormat("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                    .format(
                                      selectedUserCompletedBooking?.cartItems.reduce(
                                        (acc, cur) =>
                                          acc + cur.price * cur.quantity,
                                        0
                                      )
                                    )
                                    .replace("₹", "")
                                    .trim()
                                : "0.00"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-b">
                              Convenience Fee
                            </td>
                            <td className="py-2 px-4 border-b text-right">
                              ₹18.00
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 font-bold">Total</td>
                            <td className="py-2 px-4 text-right font-bold">
                              ₹
                              {selectedUserCompletedBooking?.cartItems
                                ? new Intl.NumberFormat("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                    .format(
                                      selectedUserCompletedBooking?.cartItems.reduce(
                                        (acc, cur) =>
                                          acc + cur.price * cur.quantity,
                                        18
                                      )
                                    )
                                    .replace("₹", "")
                                    .trim()
                                : "0.00"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </section>
                    <section className="flex justify-end items-center">
                      <Button
                        variant="gradient"
                        color="blue"
                        className="rounded"
                        onClick={handleOpenUserBookingCompletedDialog}
                      >
                        Close Dialog
                      </Button>
                    </section>
                  </div>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      ) : serviceProviderBookings.length <= 0 ? (
        <div className="flex flex-col items-center p-6 rounded-lg shadow-md">
          <div className="text-2xl font-semibold text-gray-700 mb-2 flex items-center gap-2 ">
            🫠 Uh oh
          </div>
          <div className="mb-4">You have no service request yet!</div>
          <ul className="bg-white p-4 rounded-lg shadow-sm w-full max-w-lg">
            <p className="text-lg font-semibold text-indigo-500 mb-2">
              📈 Tips to get more bookings:
            </p>
            <li className="text-gray-600 mb-2 flex items-center gap-2">
              <FaAngleDoubleRight className="text-indigo-500" />
              Try adding as many services as you can.
            </li>
            <li className="text-gray-600 mb-2 flex items-center gap-2">
              <FaAngleDoubleRight className="text-indigo-500" />
              Try a wide range of locations where you are available.
            </li>
            <li className="text-gray-600 flex items-center gap-2">
              <FaAngleDoubleRight className="text-indigo-500" />
              Your location is only valid within a 15km radius.
            </li>
            <Link href={`/service-provider/${user._id}`}>
              <Button variant="gradient" color="blue" className="mt-6 rounded">
                Go to profile
              </Button>
            </Link>
          </ul>
        </div>
      ) : (
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceProviderBookings.map((service, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 flex gap-4 flex-col">
                  {service.cartItems.map((item, itemIndex) => (
                    <div className="flex flex-col gap-2" key={item._id}>
                      <div
                        key={itemIndex}
                        className={`flex items-center space-x-2 pb-4 `}
                      >
                        <div className="flex-shrink-0">
                          <img
                            className="w-16 h-16 rounded-full object-cover"
                            src={item.icon?.url}
                            alt={item.name}
                          />
                        </div>
                        <div className="flex-grow">
                          <h2 className="text-lg font-semibold text-gray-800">
                            {item.name}
                          </h2>
                          <div className="flex items-center justify-between gap-4 mt-1">
                            <p className="text-lg font-bold text-teal-600">
                              ₹{item.price}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                      {itemIndex < service.cartItems.length - 1 ? (
                        <div className="h-px bg-gray-300 w-full"></div>
                      ) : (
                        ""
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium transition-all hover:bg-gray-300"
                  onClick={() => handleViewClick(service)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog
        open={open}
        handler={handleOpenDialog}
        dismiss={{ enabled: false }}
        size="xl"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.1, y: 500 },
        }}
        className="bg-gray-100 p-6"
      >
        <DialogHeader className="flex justify-between items-center p-0 mb-2 px-4">
          <div className="font-julius text-2xl font-bold ">Booking Details</div>
          <IconButton variant="text" onClick={handleOpenDialog}>
            <RxCross1 size={20} />
          </IconButton>
        </DialogHeader>
        <div className="max-h-[32rem] overflow-auto px-4">
          <section className="mb-8">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4">
              {selectedBooking?.cartItems?.map((item) => {
                return (
                  <div className="flex items-center gap-3" key={item._id}>
                    <img
                      src={item.icon?.url}
                      className="rounded-md w-28 h-28 object-cover"
                      alt="Booking"
                    />
                    <div className="flex flex-col gap-1">
                      <h3 className="md:text-2xl sm:text-2xl text-xl text-gray-700 ">
                        {item.name}
                      </h3>
                      <p>
                        Price:{" "}
                        <strong className="text-teal-500 font-semibold">
                          ₹{item.price}
                        </strong>
                      </p>
                      <p>
                        Qty:{" "}
                        <strong className="text-gray-600">
                          {item.quantity}
                        </strong>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className="text-blue-700 text-xl font-medium whitespace-nowrap">
              Customer Information
            </h3>
            <div className=" flex flex-col gap-4 sm:flex-row justify-between">
              <div className="w-1/2 flex flex-col gap-1">
                <p>
                  Full Name:{" "}
                  <strong className="text-gray-600">
                    {selectedBooking?.fullname}
                  </strong>
                </p>
                <p>
                  Phone:{" "}
                  <strong className="text-gray-600">
                    +91 {selectedBooking?.phoneNumber}
                  </strong>
                </p>
                <p>
                  Address:{" "}
                  <strong className="text-gray-600">
                    {selectedBooking?.address}
                  </strong>
                </p>

                <p>
                  Booking Date:{" "}
                  <strong className="text-gray-600">
                    {selectedBooking?.date}
                  </strong>
                </p>
              </div>
              <div className="w-1/2 flex flex-col gap-1">
                <p>
                  Day of departure:{" "}
                  <strong className="text-gray-600">
                    {selectedBooking?.date}
                  </strong>
                </p>
                <p>
                  Time of departure:{" "}
                  <strong className="text-gray-600">
                    {selectedBooking?.time}
                  </strong>
                </p>
              </div>
            </div>
          </section>
          <LoadScriptNext
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            loading="lazy"
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={14}
              center={selectedBooking?.location}
            >
              <Marker position={selectedBooking?.location} />
            </GoogleMap>
          </LoadScriptNext>
          <section className="mb-8 mt-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-left font-julius lg:text-2xl md:text-xl sm:text-xl text-xl text-gray-700 font-bold">
                    Summary
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr>
                  <td className="py-2 px-4 border-b">Subtotal</td>
                  <td className="py-2 px-4 border-b text-right">
                    ₹
                    {selectedBooking?.cartItems
                      ? new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                          .format(
                            selectedBooking.cartItems.reduce(
                              (acc, cur) => acc + cur.price * cur.quantity,
                              0
                            )
                          )
                          .replace("₹", "")
                          .trim()
                      : "0.00"}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-4 border-b">Convenience Fee</td>
                  <td className="py-2 px-4 border-b text-right">₹18.00</td>
                </tr>
                <tr className="text-gray-700 font-semibold">
                  <td className="py-2 px-4 border-b">Total</td>
                  <td className="py-2 px-4 border-b text-right">
                    ₹
                    {selectedBooking?.cartItems
                      ? new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                          .format(
                            selectedBooking.cartItems.reduce(
                              (acc, cur) => acc + cur.price * cur.quantity,
                              18
                            )
                          )
                          .replace("₹", "")
                          .trim()
                      : "0.00"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          {selectedBooking?.acceptedByServiceProvider && (
            <div className="flex flex-col justify-center items-center lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              {otpVerified ? (
                <div className="bg-white rounded-lg shadow-md lg:w-2/5 md:w-10/12 sm:w-10/12 w-full min-h-44 p-4 flex items-center flex-col justify-center">
                  <div className="text-2xl font-julius text-teal-500 font-bold flex flex-col items-center gap-1">
                    <RiVerifiedBadgeFill size={75} /> OTP Verified
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md lg:w-2/5 md:w-10/12 sm:w-10/12 w-full min-h-44 p-4 flex items-center flex-col justify-center">
                  <h2 className="font-julius md:text-xl sm:text-xl text-lg text-gray-500 font-bold">
                    Enter reached verification OTP
                  </h2>

                  <div className="w-full px-6 flex items-center flex-col md:flex-row justify-center gap-4 mt-4">
                    <div className="flex items-center justify-center gap-4">
                      {otp.map((data, index) => {
                        return (
                          <input
                            key={index}
                            type="text"
                            name="otp"
                            maxLength="1"
                            className="w-12 h-12 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                            value={data}
                            onChange={(e) => handleChangeOtp(e.target, index)}
                            onFocus={(e) => e.target.select()}
                          />
                        );
                      })}
                    </div>
                    <button
                      variant="gradient"
                      color="teal"
                      className="rounded px-4 py-2 flex items-center gap-1 bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-100 transition-all font-semibold"
                      onClick={handleVerifyOtp}
                    >
                      Verify <FaCheckCircle />
                    </button>
                  </div>
                  {otpVerifyingError && (
                    <div className="text-red-500 text-xs">
                      {otpVerifyingError}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white flex justify-center items-center rounded-lg shadow-md lg:w-3/5 md:w-10/12 sm:w-10/12 w-full min-h-44 p-4">
                <div className="flex gap-4 flex-col md:flex-row items-center justify-center">
                  <div className="flex justify-center">
                    <img
                      src={uploadedImage || "https://placehold.co/400"}
                      alt="Uploaded"
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-center md:items-start justify-center gap-2">
                    <h2 className="font-julius md:text-xl sm:text-xl text-md text-gray-500 font-bold">
                      Upload verification image
                    </h2>
                    <label
                      htmlFor="verification-image"
                      className="flex items-center gap-1 w-fit cursor-pointer text-sm bg-blue-500 text-white px-4 py-2 rounded uppercase font-semibold hover:shadow-lg hover:shadow-blue-100 transition-all"
                    >
                      Upload Image <MdOutlineCloudUpload />
                    </label>
                    <input
                      id="verification-image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <section className="mb-8 mt-4">
            <h3 className="text-xl font-bold text-red-600">Caution:</h3>
            <ol className="list-decimal ml-6 mt-2 text-gray-700">
              <li>Accept the booking as soon as possible.</li>
              <li>Rejection cannot be undone later.</li>
              <li>Verify OTP from the customer.</li>
              <li>Attach an image of doing servicing</li>
            </ol>
          </section>
          {!selectedBooking?.acceptedByServiceProvider && (
            <div className="my-4 flex justify-end">
              <div className="flex gap-2 w-full md:w-fit">
                <Button
                  variant="outlined"
                  color="teal"
                  ripple
                  className="w-full md:w-fit md:px-10 rounded"
                  onClick={() => {
                    handleRejectRequest(selectedBooking?._id);
                  }}
                >
                  Reject
                </Button>
                <Button
                  variant="gradient"
                  color="teal"
                  ripple
                  className="w-full md:w-fit md:px-10 rounded"
                  onClick={() => {
                    handleAcceptRequest(selectedBooking?._id);
                  }}
                >
                  Accept
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
      <Footer />
    </div>
  );
};

export default Booking;
