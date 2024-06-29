"use client";
import { Player } from "@lottiefiles/react-lottie-player";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  IconButton,
  Button,
  Textarea,
  Select,
  Option,
  Alert,
} from "@material-tailwind/react";
import { GrStatusInfo } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";
import { Typography } from "@material-tailwind/react";
import { FaEye, FaPhone } from "react-icons/fa6";
import { IoMdMailOpen, IoMdOpen } from "react-icons/io";
import { FaBookmark } from "react-icons/fa";
import { Rating } from "@material-tailwind/react";
import { PiGenderIntersexFill } from "react-icons/pi";
import axios from "axios";
import Link from "next/link";
import { GoAlertFill } from "react-icons/go";

const UserBooking = ({ user }) => {
  //Service Provider detail showing to user dialog
  const [openServiceProviderDetailDialog, setOpenServiceProviderDetailDialog] =
    useState(false);

  const handleServiceProviderDetailDialog = () =>
    setOpenServiceProviderDetailDialog(!openServiceProviderDetailDialog);

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
  const [userCanceledBookings, setUserCanceledBookings] = useState([]);

  // Canceled Bookings code!
  const [openUserBookingCanceledDialog, setOpenUserBookingCanceledDialog] =
    useState(false);
  const handleOpenUserBookingCanceledDialog = () =>
    setOpenUserBookingCanceledDialog(!openUserBookingCanceledDialog);
  const [selectedUserCanceledBooking, setSelectedUserCanceledBooking] =
    useState({
      cartItems: [],
      otp: "",
    });

  const getUserBookings = async () => {
    try {
      const response = await axios.post(
        `/api/bookings/bookings-from-array-of-id`,
        user?.bookings
      );
      const data = response.data;
      const incompleteBookings = data.filter(
        (booking) =>
          !booking.completed &&
          !booking.noServiceProviderAvailable &&
          !booking.canceledByCustomer
      );
      const canceledBookings = data.filter(
        (booking) =>
          booking.canceledByCustomer && !booking.noServiceProviderAvailable
      );

      const completedBookings = data.filter((booking) => booking.completed);

      const noServiceProviderAvailableBookings = data.filter(
        (booking) => booking.noServiceProviderAvailable
      );

      setUserBookings(incompleteBookings);
      setUserCanceledBookings(canceledBookings);
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

  const [disableCancelBookingButton, setDisableCancelBookingButton] =
    useState(false);

  const checkBetweenTimeAndDate = () => {
    const cancelValidationValueInHours = 120; // minutes
    const getCurrentDate = () => {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = date.getFullYear();

      return Number(`${day}${month}${year}`);
    };

    const getCurrentTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return Number(`${hours}${minutes}`);
    };

    const currentDate = getCurrentDate(); // e.g., 26062024
    const currentTime = getCurrentTime(); // e.g., 2000 (for 20:00)
    const formattedScheduleDate = Number(
      selectedUserBooking.date?.split("-").join("")
    );
    const formattedScheduleTime = Number(
      selectedUserBooking.time?.split(":").join("")
    );

    if (currentDate > formattedScheduleDate) {
      setDisableCancelBookingButton(true);
    } else {
      if (currentTime <= formattedScheduleTime - cancelValidationValueInHours) {
        setDisableCancelBookingButton(false);
      } else {
        setDisableCancelBookingButton(true);
      }
    }
  };
  const [cancellationReasonDialog, setCancellationReasonDialog] =
    useState(false);
  const handleCancellationReasonDialog = () =>
    setCancellationReasonDialog(!cancellationReasonDialog);
  const [cancellationReasonNotListed, setCancellationReasonNotListed] =
    useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [openCancellationAlert, setOpenCancellationAlert] = useState(false);
  const handleCancelBooking = async () => {
    try {
      if (cancellationReason === "") {
        setOpenCancellationAlert(true);
        return;
      }
      const response = await axios.put(
        `/api/bookings/${selectedUserBooking._id}`,
        {
          ...selectedUserBooking,
          canceledByCustomer: cancellationReason,
        }
      );
      if (response.status === 201) {
        setUserCanceledBookings([...userCanceledBookings, selectedUserBooking]);
        setUserBookings(
          userBookings.filter((booking) => booking._id!== selectedUserBooking._id)
        );
        handleCancellationReasonDialog();
        handleOpenUserBookingDialog();
        setCancellationReason("");
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    checkBetweenTimeAndDate();
  }, [selectedUserBooking]);

  return (
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
                  <header className="flex items-center justify-between gap-2">
                    <h1 className="text-center text-xl lg:text-2xl text-gray-700">
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
                      <div className="text-gray-800 font-bold flex flex-col gap-2">
                        About Service Provider:
                        <div className="flex gap-2 items-center">
                          <Image
                            src={
                              selectedUserBooking?.assignedServiceProviders
                                ?.image?.url
                            }
                            className="rounded-full h-12 w-12 object-cover"
                            alt="Booking"
                            width={96}
                            height={96}
                          />
                          <div className="flex flex-col">
                            <div className="text-gray-700 font-semibold text-xl">
                              {
                                selectedUserBooking?.assignedServiceProviders
                                  ?.name
                              }
                            </div>
                            <div className="text-gray-700 text-sm font-medium">
                              {
                                selectedUserBooking?.assignedServiceProviders
                                  ?.phoneNumber
                              }
                            </div>
                          </div>
                          <button
                            onClick={handleServiceProviderDetailDialog}
                            className="flex items-center justify-center rounded-full bg-blue-100 w-10 h-10"
                          >
                            <IoMdOpen size={15} />
                          </button>
                        </div>
                        <Dialog
                          open={openServiceProviderDetailDialog}
                          handler={handleServiceProviderDetailDialog}
                          size="sm"
                          className="p-6"
                          animate={{
                            mount: { scale: 1, y: 0 },
                            unmount: { scale: 0.1, y: 500 },
                          }}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="text-xl font-semibold text-blue-gray-500">
                              Service provider detail
                            </div>

                            <IconButton
                              variant="text"
                              color="blue-gray"
                              onClick={handleServiceProviderDetailDialog}
                            >
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
                              <div>
                                <Image
                                  src={
                                    selectedUserBooking
                                      ?.assignedServiceProviders?.image?.url
                                  }
                                  className="rounded-full h-16 w-16 object-cover"
                                  alt="Booking"
                                  width={96}
                                  height={96}
                                />
                              </div>
                              <div>
                                <Typography
                                  variant="h5"
                                  color="blue"
                                  className="font-semibold"
                                >
                                  {
                                    selectedUserBooking
                                      ?.assignedServiceProviders?.name
                                  }
                                </Typography>
                                <div className="text-gray-800 flex items-center gap-2 mx-auto  font-bold">
                                  <Rating value={4} readonly /> 4.5
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            color="gray"
                            className="flex flex-col gap-3 items-start pr-4 font-normal"
                          >
                            <div className="flex items-center gap-3">
                              <FaPhone className="text-teal-500" size={23} />
                              Phone: +91{" "}
                              {
                                selectedUserBooking?.assignedServiceProviders
                                  ?.phoneNumber
                              }
                            </div>
                            <div className="flex items-center gap-3">
                              <IoMdMailOpen
                                className="text-deep-purple-500"
                                size={23}
                              />
                              Email:{" "}
                              {
                                selectedUserBooking?.assignedServiceProviders
                                  ?.email
                              }
                            </div>
                            <div className="flex items-center gap-3">
                              <PiGenderIntersexFill
                                className="text-blue-500"
                                size={23}
                              />
                              Gender:{" "}
                              {
                                selectedUserBooking?.assignedServiceProviders
                                  ?.gender
                              }
                            </div>
                            <div className="flex items-center gap-3">
                              <FaBookmark
                                className="text-amber-500"
                                size={23}
                              />
                              Booked Over: 5 times
                            </div>
                          </div>
                        </Dialog>
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
                        Quantity: <strong className="text-gray-600">1</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2 flex-col">
                          <div className="text-gray-800 font-bold flex gap-2 items-center">
                            Verification OTP:{" "}
                            <span className="flex items-center gap-2">
                              {selectedUserBooking.otp.split("").map((code) => {
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
                  <section className="flex justify-between items-center flex-col lg:flex-row gap-4">
                    <p className="font-medium text-red-600 text-sm">
                      Note: Order can be cancelled up to{" "}
                      <strong>2 hours</strong> before the scheduled time.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        className="rounded"
                        variant="outlined"
                        color="red"
                        disabled={disableCancelBookingButton}
                        onClick={handleCancellationReasonDialog}
                      >
                        Cancel Booking
                      </Button>
                      <Dialog
                        open={cancellationReasonDialog}
                        handler={handleCancellationReasonDialog}
                        className="p-6"
                      >
                        <Alert
                          variant="gradient"
                          className="mb-2"
                          animate={{
                            mount: { y: 0 },
                            unmount: { y: 100 },
                          }}
                          color="red"
                          open={openCancellationAlert}
                          action={
                            <IconButton
                              variant="text"
                              className="!absolute top-2 right-3"
                              onClick={() => setOpenCancellationAlert(false)}
                            >
                              <RxCross2 color="white" size={25} />
                            </IconButton>
                          }
                        >
                          <div className="flex gap-1 items-center">
                            {" "}
                            <GoAlertFill />
                            Please Give a reason before cancelling booking!
                          </div>
                        </Alert>
                        <div className="text-red-500 text-xl font-medium">
                          Are you sure you want to cancel this booking?
                        </div>
                        <div className="flex flex-col gap-4 mb-2">
                          <div className="text-xs">
                            Please provide a cancellation reason so that we can
                            provide a refund or compensation.
                          </div>

                          <Select
                            label="Choose a reason"
                            onChange={(e) => {
                              if (e === "not here") {
                                setCancellationReasonNotListed(true);
                                setCancellationReason("");
                              } else {
                                setCancellationReasonNotListed(false);
                                setCancellationReason(e);
                              }
                            }}
                          >
                            <Option value="Bad response">Bad response</Option>
                            <Option value="not here">Not here?</Option>
                          </Select>
                          {cancellationReasonNotListed && (
                            <Textarea
                              autoFocus
                              margin="dense"
                              id="cancellationReason"
                              label="Cancellation Reason (Optional)"
                              type="text"
                              fullWidth
                              variant="filled"
                              value={cancellationReason}
                              onChange={(e) =>
                                setCancellationReason(e.target.value)
                              }
                            />
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={handleCancellationReasonDialog}
                            className="rounded"
                            variant="outlined"
                            color="blue"
                          >
                            Go back to bookings
                          </Button>
                          <Button
                            onClick={handleCancelBooking}
                            variant="gradient"
                            color="red"
                            className="rounded"
                          >
                            Cancel Booking
                          </Button>
                        </div>
                      </Dialog>
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
                        className="rounded"
                        variant="outlined"
                        color="red"
                        disabled={disableCancelBookingButton}
                        onClick={handleCancellationReasonDialog}
                      >
                        Cancel Booking
                      </Button>
                      <Dialog
                        open={cancellationReasonDialog}
                        handler={handleCancellationReasonDialog}
                        className="p-6"
                      >
                        <Alert
                          variant="gradient"
                          className="mb-2"
                          animate={{
                            mount: { y: 0 },
                            unmount: { y: 100 },
                          }}
                          color="red"
                          open={openCancellationAlert}
                          action={
                            <IconButton
                              variant="text"
                              className="!absolute top-2 right-3"
                              onClick={() => setOpenCancellationAlert(false)}
                            >
                              <RxCross2 color="white" size={25} />
                            </IconButton>
                          }
                        >
                          <div className="flex gap-1 items-center">
                            {" "}
                            <GoAlertFill />
                            Please Give a reason before cancelling booking!
                          </div>
                        </Alert>
                        <div className="text-red-500 text-xl font-medium">
                          Are you sure you want to cancel this booking?
                        </div>
                        <div className="flex flex-col gap-4 mb-2">
                          <div className="text-xs">
                            Please provide a cancellation reason so that we can
                            provide a refund or compensation.
                          </div>

                          <Select
                            label="Choose a reason"
                            onChange={(e) => {
                              if (e === "not here") {
                                setCancellationReasonNotListed(true);
                                setCancellationReason("");
                              } else {
                                setCancellationReasonNotListed(false);
                                setCancellationReason(e);
                              }
                            }}
                          >
                            <Option value="Bad response">Bad response</Option>
                            <Option value="not here">Not here?</Option>
                          </Select>
                          {cancellationReasonNotListed && (
                            <Textarea
                              autoFocus
                              margin="dense"
                              id="cancellationReason"
                              label="Cancellation Reason (Optional)"
                              type="text"
                              fullWidth
                              variant="filled"
                              value={cancellationReason}
                              onChange={(e) =>
                                setCancellationReason(e.target.value)
                              }
                            />
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={handleCancellationReasonDialog}
                            className="rounded"
                            variant="outlined"
                            color="blue"
                          >
                            Go back to bookings
                          </Button>
                          <Button
                            onClick={handleCancelBooking}
                            variant="gradient"
                            color="red"
                            className="rounded"
                          >
                            Cancel Booking
                          </Button>
                        </div>
                      </Dialog>
                    </div>
                  </div>
                </div>
              )}
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
                    className="px-4 py-2 bg-teal-500 text-white text-sm font-medium transition-all hover:bg-teal-600 flex items-center gap-2 justify-center"
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
                    {selectedUserCompletedBooking?.cartItems?.map((item) => {
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
                          selectedUserCompletedBooking?.assignedServiceProviders
                            ?.name
                        }
                      </span>
                      <div
                        onClick={handleServiceProviderDetailDialog}
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
                        <td className="py-2 px-4 border-b">Convenience Fee</td>
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
      {userCanceledBookings.length > 0 && (
        <div className="px-10 my-10">
          <h2 className="text-2xl text-purple-500 font-semibold">
            Your Canceled bookings
          </h2>
          <div className="h-px bg-gray-300 w-full my-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
            {userCanceledBookings.map((service, index) => {
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
                    className="px-4 py-2 bg-purple-500 text-white text-sm font-medium transition-all hover:bg-purple-600 flex items-center gap-2 justify-center"
                    onClick={() => {
                      setSelectedUserCanceledBooking(service);
                      handleOpenUserBookingCanceledDialog();
                    }}
                  >
                    View
                    <IoMdOpen />
                  </button>
                </div>
              );
            })}
            <Dialog
              open={openUserBookingCanceledDialog}
              handler={handleOpenUserBookingCanceledDialog}
              size="lg"
              animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0.1, y: 500 },
              }}
            >
              <div
                key={selectedUserCanceledBooking._id}
                className="container overflow-auto bg-white rounded-lg p-6 h-[36rem]"
              >
                <header className="flex items-center justify-between gap-2">
                  <h1 className="text-center text-xl lg:text-2xl text-gray-700">
                    Booking Details
                  </h1>
                  <IconButton
                    variant="text"
                    onClick={handleOpenUserBookingCanceledDialog}
                  >
                    <RxCross2 size={25} />
                  </IconButton>
                </header>
                <div className="h-px bg-gray-300 w-full my-4"></div>
                <section>
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                    {selectedUserCanceledBooking?.cartItems?.map((item) => {
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
                  <h4 className="text-blue-500 font-semibold text-xl mt-4">
                    Your Information
                  </h4>
                  <div className="h-px bg-gray-300 w-full mt-2 mb-1"></div>
                  <div className="flex flex-col justify-between gap-4">
                    <div>
                      Full Name:{" "}
                      <strong className="text-gray-600">
                        {selectedUserCanceledBooking?.fullname}
                      </strong>
                    </div>
                    <div>
                      Phone:{" "}
                      <strong className="text-gray-600">
                        +91 {selectedUserCanceledBooking?.phoneNumber}
                      </strong>
                    </div>
                    <div>
                      Address:{" "}
                      <strong className="text-gray-600">
                        {selectedUserCanceledBooking?.address}
                      </strong>
                    </div>
                    <div>
                      Booking Date:{" "}
                      <strong className="text-gray-600">
                        {selectedUserCanceledBooking?.date}
                      </strong>
                    </div>
                    <div className="text-gray-800 font-bold flex items-center gap-2">
                      Status:{" "}
                      <span className="text-teal-500 rounded-md">
                        {selectedUserCanceledBooking?.status}
                      </span>
                    </div>
                    {selectedUserCanceledBooking?.assignedServiceProviders
                      ?.name && (
                      <div className="text-gray-800 font-bold flex flex-col gap-2">
                        About Service Provider:
                        <div className="flex gap-2 items-center">
                          <Image
                            src={
                              selectedUserCanceledBooking
                                ?.assignedServiceProviders?.image?.url
                            }
                            className="rounded-full h-12 w-12 object-cover"
                            alt="Booking"
                            width={96}
                            height={96}
                          />
                          <div className="flex flex-col">
                            <div className="text-gray-700 font-semibold text-xl">
                              {
                                selectedUserCanceledBooking
                                  ?.assignedServiceProviders?.name
                              }
                            </div>
                            <div className="text-gray-700 text-sm font-medium">
                              {
                                selectedUserCanceledBooking
                                  ?.assignedServiceProviders?.phoneNumber
                              }
                            </div>
                          </div>
                          <button
                            onClick={handleServiceProviderDetailDialog}
                            className="flex items-center justify-center rounded-full bg-purple-100 w-10 h-10"
                          >
                            <IoMdOpen size={15} />
                          </button>
                        </div>
                        <Dialog
                          open={openServiceProviderDetailDialog}
                          handler={handleServiceProviderDetailDialog}
                          size="sm"
                          className="p-6"
                          animate={{
                            mount: { scale: 1, y: 0 },
                            unmount: { scale: 0.1, y: 500 },
                          }}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="text-xl font-semibold text-blue-gray-500">
                              Service provider detail
                            </div>

                            <IconButton
                              variant="text"
                              color="blue-gray"
                              onClick={handleServiceProviderDetailDialog}
                            >
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
                              <div>
                                <Image
                                  src={
                                    selectedUserCanceledBooking
                                      ?.assignedServiceProviders?.image?.url
                                  }
                                  className="rounded-full h-16 w-16 object-cover"
                                  alt="Booking"
                                  width={96}
                                  height={96}
                                />
                              </div>
                              <div>
                                <Typography
                                  variant="h5"
                                  color="blue"
                                  className="font-semibold"
                                >
                                  {
                                    selectedUserCanceledBooking
                                      ?.assignedServiceProviders?.name
                                  }
                                </Typography>
                                <div className="text-gray-800 flex items-center gap-2 mx-auto  font-bold">
                                  <Rating value={4} readonly /> 4.5
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            color="gray"
                            className="flex flex-col gap-3 items-start pr-4 font-normal"
                          >
                            <div className="flex items-center gap-3">
                              <FaPhone className="text-teal-500" size={23} />
                              Phone: +91{" "}
                              {
                                selectedUserCanceledBooking
                                  ?.assignedServiceProviders?.phoneNumber
                              }
                            </div>
                            <div className="flex items-center gap-3">
                              <IoMdMailOpen
                                className="text-deep-purple-500"
                                size={23}
                              />
                              Email:{" "}
                              {
                                selectedUserCanceledBooking
                                  ?.assignedServiceProviders?.email
                              }
                            </div>
                            <div className="flex items-center gap-3">
                              <PiGenderIntersexFill
                                className="text-blue-500"
                                size={23}
                              />
                              Gender:{" "}
                              {
                                selectedUserCanceledBooking
                                  ?.assignedServiceProviders?.gender
                              }
                            </div>
                            <div className="flex items-center gap-3">
                              <FaBookmark
                                className="text-amber-500"
                                size={23}
                              />
                              Booked Over: 5 times
                            </div>
                          </div>
                        </Dialog>
                      </div>
                    )}

                    <div className="h-px bg-gray-300 w-full"></div>
                    <div>
                      Day of departure:{" "}
                      <strong className="text-gray-600">
                        {selectedUserCanceledBooking?.date}
                      </strong>
                    </div>
                    <div>
                      Time of departure:{" "}
                      <strong className="text-gray-600">
                        {selectedUserCanceledBooking?.time}
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
                            {selectedUserCanceledBooking.otp
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
                          {selectedUserCanceledBooking?.cartItems
                            ? new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                                .format(
                                  selectedUserCanceledBooking?.cartItems.reduce(
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
                        <td className="py-2 px-4 border-b">Convenience Fee</td>
                        <td className="py-2 px-4 border-b text-right">
                          ₹18.00
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-bold">Total</td>
                        <td className="py-2 px-4 text-right font-bold">
                          ₹
                          {selectedUserCanceledBooking?.cartItems
                            ? new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                                .format(
                                  selectedUserCanceledBooking?.cartItems.reduce(
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
                {/* <section className="flex justify-between items-center flex-col lg:flex-row gap-4">
                    <p className="font-medium text-red-600 text-sm">
                      Note: Order can be cancelled up to{" "}
                      <strong>2 hours</strong> before the scheduled time.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        className="rounded"
                        variant="outlined"
                        color="red"
                        disabled={disableCancelBookingButton}
                        onClick={handleCancellationReasonDialog}
                      >
                        Cancel Booking
                      </Button>
                      <Dialog
                        open={cancellationReasonDialog}
                        handler={handleCancellationReasonDialog}
                        className="p-6"
                      >
                        <Alert
                          variant="gradient"
                          className="mb-2"
                          animate={{
                            mount: { y: 0 },
                            unmount: { y: 100 },
                          }}
                          color="red"
                          open={openCancellationAlert}
                          action={
                            <IconButton
                              variant="text"
                              className="!absolute top-2 right-3"
                              onClick={() => setOpenCancellationAlert(false)}
                            >
                              <RxCross2 color="white" size={25} />
                            </IconButton>
                          }
                        >
                          <div className="flex gap-1 items-center">
                            {" "}
                            <GoAlertFill />
                            Please Give a reason before cancelling booking!
                          </div>
                        </Alert>
                        <div className="text-red-500 text-xl font-medium">
                          Are you sure you want to cancel this booking?
                        </div>
                        <div className="flex flex-col gap-4 mb-2">
                          <div className="text-xs">
                            Please provide a cancellation reason so that we can
                            provide a refund or compensation.
                          </div>

                          <Select
                            label="Choose a reason"
                            onChange={(e) => {
                              if (e === "not here") {
                                setCancellationReasonNotListed(true);
                                setCancellationReason("");
                              } else {
                                setCancellationReasonNotListed(false);
                                setCancellationReason(e);
                              }
                            }}
                          >
                            <Option value="Bad response">Bad response</Option>
                            <Option value="not here">Not here?</Option>
                          </Select>
                          {cancellationReasonNotListed && (
                            <Textarea
                              autoFocus
                              margin="dense"
                              id="cancellationReason"
                              label="Cancellation Reason (Optional)"
                              type="text"
                              fullWidth
                              variant="filled"
                              value={cancellationReason}
                              onChange={(e) =>
                                setCancellationReason(e.target.value)
                              }
                            />
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={handleCancellationReasonDialog}
                            className="rounded"
                            variant="outlined"
                            color="blue"
                          >
                            Go back to bookings
                          </Button>
                          <Button
                            onClick={handleCancelBooking}
                            variant="gradient"
                            color="red"
                            className="rounded"
                          >
                            Cancel Booking
                          </Button>
                        </div>
                      </Dialog>
                      <Button
                        variant="gradient"
                        color="blue"
                        className="rounded"
                        onClick={handleOpenUserBookingDialog}
                      >
                        Close Dialog
                      </Button>
                    </div>
                  </section> */}
              </div>
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
            {userNoServiceProviderAvailableBookings.map((service, index) => {
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
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium transition-all hover:bg-red-600 flex items-center gap-2 justify-center"
                    onClick={() => {
                      setSelectedUserexpiredBooking(service);
                      handleOpenUserBookingexpiredDialog();
                    }}
                  >
                    View <IoMdOpen />
                  </button>
                </div>
              );
            })}
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
    </div>
  );
};

export default UserBooking;
