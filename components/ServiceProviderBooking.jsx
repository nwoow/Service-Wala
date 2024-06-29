import React, { useEffect, useState } from "react";
import {
  Dialog,
  IconButton,
  DialogHeader,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";
import { RxCross1 } from "react-icons/rx";
import { FaAngleDoubleRight, FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import { GoogleMap, Marker, LoadScriptNext } from "@react-google-maps/api";
import { MdOutlineCloudUpload } from "react-icons/md";
import { RiAlertFill, RiVerifiedBadgeFill } from "react-icons/ri";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/firebase";
import Link from "next/link";

import Invoice from "@/components/Invoice";
import { IoMdOpen } from "react-icons/io";

const ServiceProviderBooking = ({ user }) => {
  const mapContainerStyle = {
    width: "100%",
    height: "60vh",
  };
  const [serviceProviderBookings, setServiceProviderBookings] = useState([]);
  const [serviceProviderNewBookings, setServiceProviderNewBookings] = useState(
    []
  );
  const [serviceProviderCanceledBookings, setServiceProviderCanceledBookings] =
    useState([]);
  const [
    serviceProviderCompletedBookings,
    setServiceProviderCompletedBookings,
  ] = useState([]);

  const [openNewBookingDialog, setOpenNewBookingDialog] = useState(false);
  const handleOpenNewBookingDialog = () =>
    setOpenNewBookingDialog(!openNewBookingDialog);
  const [selectedNewBooking, setSelectedNewBooking] = useState({});

  const [openCanceledBookingDialog, setOpenCanceledBookingDialog] =
    useState(false);
  const handleOpenCanceledBookingDialog = () =>
    setOpenCanceledBookingDialog(!openCanceledBookingDialog);
  const [selectedCanceledBooking, setSelectedCanceledBooking] = useState({});

  const [openCompletedBookingDialog, setOpenCompletedBookingDialog] =
    useState(false);
  const handleOpenCompletedBookingDialog = () =>
    setOpenCompletedBookingDialog(!openCompletedBookingDialog);
  const [selectedCompletedBooking, setSelectedCompletedBooking] = useState({});

  const gettingServiceProviderBookings = async () => {
    try {
      const response = await axios.post(
        `/api/bookings/bookings-from-array-of-id`,
        user?.bookings
      );
      const data = response.data;
      // console.log(data);
      const newBookings = data.filter(
        (booking) => !booking.completed && !booking.canceledByCustomer
      );
      const completedBookings = data.filter((booking) => booking.completed);
      const canceledBookings = data.filter(
        (booking) => booking.canceledByCustomer
      );
      setServiceProviderBookings(data);
      setServiceProviderNewBookings(newBookings);
      setServiceProviderCompletedBookings(completedBookings);
      setServiceProviderCanceledBookings(canceledBookings);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user?.bookings?.length > 0) {
      gettingServiceProviderBookings();
    }
  }, [user]);

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
    if (otpValue != selectedNewBooking.otp) {
      setOtpVerifyingError("Invalid otp");
      return;
    }
    setOtpVerified(true);
    setOtp(["", "", "", ""]);
    const postData = { ...selectedNewBooking, otpVerified: true };
    const res = await axios.put(
      `/api/bookings/${selectedNewBooking._id}`,
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

    if (selectedNewBooking?.verificationImage?.url) {
      await deleteObject(
        ref(storage, selectedNewBooking?.verificationImage?.name)
      );
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
      ...selectedNewBooking,
      verificationImage: imageObject,
    };
    const res = await axios.put(
      `/api/bookings/${selectedBooking._id}`,
      postData
    );
  };
  useEffect(() => {
    if (selectedNewBooking?.otpVerified === true) {
      setOtpVerified(true);
    }
    if (selectedNewBooking?.otpVerified !== true) {
      setOtpVerified(false);
    }
    if (selectedNewBooking?.verificationImage?.url) {
      setUploadedImage(selectedNewBooking?.verificationImage?.url);
    }
    setOtpVerifyingError("");
  }, [selectedNewBooking]);

  const handleUpdateServiceStatusByServiceProvider = async (e) => {
    try {
      const updatedStatusBooking = {
        ...selectedBooking,
        status: e,
      };
      setSelectedBooking(updatedStatusBooking);
      await axios.put(
        `/api/bookings/${selectedBooking._id}`,
        updatedStatusBooking
      );
    } catch (err) {
      console.log(err);
    }
  };

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
      status: "Service is not started",
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

  return (
    <div>
      {serviceProviderBookings.length <= 0 ? (
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
        <div>
          {serviceProviderNewBookings.length > 0 && (
            <div className="container mx-auto py-8 px-4 lg:px-0">
              <h2 className="text-2xl text-blue-500 font-semibold">
                New Bookings!
              </h2>
              <div className="h-px bg-gray-300 w-full my-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceProviderNewBookings.map((service, index) => (
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
                      className="px-4 py-2 bg-blue-500 text-white text-sm font-medium transition-all hover:bg-blue-600 flex items-center gap-1 justify-center"
                      onClick={() => {
                        handleOpenNewBookingDialog();
                        setSelectedNewBooking(service);
                      }}
                    >
                      View
                      <IoMdOpen />
                    </button>
                  </div>
                ))}
              </div>
              <Dialog
                open={openNewBookingDialog}
                handler={handleOpenNewBookingDialog}
                size="xl"
                animate={{
                  mount: { scale: 1, y: 0 },
                  unmount: { scale: 0.1, y: 500 },
                }}
                className="bg-gray-100 p-6"
              >
                <DialogHeader className="flex justify-between items-center p-0 mb-2 px-4">
                  <div className="font-julius text-2xl font-bold ">
                    Booking Details
                  </div>
                  <IconButton
                    variant="text"
                    onClick={handleOpenNewBookingDialog}
                  >
                    <RxCross1 size={20} />
                  </IconButton>
                </DialogHeader>
                <div className="max-h-[32rem] overflow-auto px-4">
                  <section className="mb-8">
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4">
                      {selectedNewBooking?.cartItems?.map((item) => {
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

                    <h3 className="text-blue-700 text-xl font-medium whitespace-nowrap">
                      Customer Information
                    </h3>
                    <div className=" flex flex-col gap-4 sm:flex-row justify-between">
                      <div className="w-1/2 flex flex-col gap-1">
                        <p>
                          Full Name:{" "}
                          <strong className="text-gray-600">
                            {selectedNewBooking?.fullname}
                          </strong>
                        </p>
                        <p>
                          Phone:{" "}
                          <strong className="text-gray-600">
                            +91 {selectedNewBooking?.phoneNumber}
                          </strong>
                        </p>
                        <p>
                          Address:{" "}
                          <strong className="text-gray-600">
                            {selectedNewBooking?.address}
                          </strong>
                        </p>

                        <p>
                          Booking Date:{" "}
                          <strong className="text-gray-600">
                            {selectedNewBooking?.date}
                          </strong>
                        </p>
                      </div>
                      <div className="w-1/2 flex flex-col gap-1">
                        <p>
                          Day of departure:{" "}
                          <strong className="text-gray-600">
                            {selectedNewBooking?.date}
                          </strong>
                        </p>
                        <p>
                          Time of departure:{" "}
                          <strong className="text-gray-600">
                            {selectedNewBooking?.time}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </section>
                  <LoadScriptNext
                    googleMapsApiKey={
                      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    }
                    loading="lazy"
                  >
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      zoom={14}
                      center={selectedNewBooking?.location}
                    >
                      <Marker position={selectedNewBooking?.location} />
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
                            {selectedNewBooking?.cartItems
                              ? new Intl.NumberFormat("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                  .format(
                                    selectedNewBooking.cartItems.reduce(
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
                        <tr className="text-gray-700 font-semibold">
                          <td className="py-2 px-4 border-b">Total</td>
                          <td className="py-2 px-4 border-b text-right">
                            ₹
                            {selectedNewBooking?.cartItems
                              ? new Intl.NumberFormat("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                  .format(
                                    selectedNewBooking.cartItems.reduce(
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
                  {selectedNewBooking?.acceptedByServiceProvider && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                      {otpVerified ? (
                        <div className="bg-white rounded-lg shadow-md w-full min-h-44 p-4 flex items-center flex-col justify-center">
                          <div className="text-2xl font-julius text-teal-500 font-bold flex flex-col items-center gap-1">
                            <RiVerifiedBadgeFill size={75} /> OTP Verified
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-md w-full min-h-44 p-4 flex items-center flex-col justify-center">
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
                                    onChange={(e) =>
                                      handleChangeOtp(e.target, index)
                                    }
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

                      <div className="bg-white flex justify-center items-center rounded-lg shadow-md w-full min-h-44 p-4">
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
                      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col gap-4">
                        <div>Update the status of working</div>
                        <Select
                          label="Choose a status"
                          success={
                            selectedNewBooking?.status ===
                            "Service is Completed"
                          }
                          error={
                            selectedNewBooking?.status ===
                            "Service is not started"
                          }
                          animate={{
                            mount: { y: 0 },
                            unmount: { y: 25 },
                          }}
                          value={selectedNewBooking?.status}
                          onChange={handleUpdateServiceStatusByServiceProvider}
                        >
                          <Option
                            value="Service is not started"
                            className="text-red-500"
                          >
                            Service is not started
                          </Option>
                          <Option
                            value="Service is in progress"
                            className="text-amber-500"
                          >
                            Service is in progress
                          </Option>
                          <Option
                            value="Service is Completed"
                            className="text-teal-500"
                          >
                            Service is Completed
                          </Option>
                        </Select>
                      </div>
                      <Invoice
                        selectedBooking={selectedNewBooking}
                        setSelectedBooking={setSelectedNewBooking}
                      />
                    </div>
                  )}

                  <section className="mb-8 mt-4">
                    <h3 className="text-xl font-bold text-red-600">Caution:</h3>
                    <ol className="list-decimal ml-6 mt-2 text-gray-700">
                      <li>Accept the booking as soon as possible.</li>
                      <li>Rejection cannot be undone later.</li>
                      <li>Verify OTP from the customer.</li>
                      <li>Attach an image of doing servicing</li>
                      <li>Update the status of service According to you!</li>
                      <li>
                        Generate an invoice after reviewing the customer problem
                        with the necessary details.
                      </li>
                    </ol>
                  </section>
                  {!selectedNewBooking?.acceptedByServiceProvider && (
                    <div className="my-4 flex justify-end">
                      <div className="flex gap-2 w-full md:w-fit">
                        <Button
                          variant="outlined"
                          color="teal"
                          ripple
                          className="w-full md:w-fit md:px-10 rounded"
                          onClick={() => {
                            handleRejectRequest(selectedNewBooking?._id);
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
                            handleAcceptRequest(selectedNewBooking?._id);
                          }}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog>
            </div>
          )}
          {serviceProviderCanceledBookings.length > 0 && (
            <div className="container mx-auto py-8 px-4 lg:px-0">
              <h2 className="text-2xl text-red-500 font-semibold">
                Cancelled Bookings!
              </h2>
              <div className="h-px bg-gray-300 w-full my-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceProviderCanceledBookings.map((service, index) => (
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
                      className="px-4 py-2 bg-red-500 text-white text-sm font-medium transition-all hover:bg-red-600 flex items-center gap-1 justify-center"
                      onClick={() => {
                        handleOpenCanceledBookingDialog();
                        setSelectedCanceledBooking(service);
                      }}
                    >
                      View
                      <IoMdOpen />
                    </button>
                  </div>
                ))}
              </div>
              <Dialog
                open={openCanceledBookingDialog}
                handler={handleOpenCanceledBookingDialog}
                size="xl"
                animate={{
                  mount: { scale: 1, y: 0 },
                  unmount: { scale: 0.1, y: 500 },
                }}
                className="bg-gray-100 p-6"
              >
                <DialogHeader className="flex justify-between items-center p-0 mb-2 px-4">
                  <div className="font-julius text-2xl font-bold ">
                    Booking Details
                  </div>
                  <IconButton
                    variant="text"
                    onClick={handleOpenCanceledBookingDialog}
                  >
                    <RxCross1 size={20} />
                  </IconButton>
                </DialogHeader>
                <div className="bg-red-500 text-white font-semibold w-full flex items-center gap-2 rounded-lg p-4 mb-4">
                  <RiAlertFill />
                  Service Request canceled By user!
                </div>
                <div className="max-h-[30rem] overflow-auto px-4">
                  <section className="mb-8">
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4">
                      {selectedCanceledBooking?.cartItems?.map((item) => {
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
                    <h3 className="text-blue-700 text-xl font-medium whitespace-nowrap">
                      Customer Information
                    </h3>
                    <div className=" flex flex-col gap-4 sm:flex-row justify-between">
                      <div className="w-1/2 flex flex-col gap-1">
                        <p>
                          Full Name:{" "}
                          <strong className="text-gray-600">
                            {selectedCanceledBooking?.fullname}
                          </strong>
                        </p>
                        <p>
                          Phone:{" "}
                          <strong className="text-gray-600">
                            +91 {selectedCanceledBooking?.phoneNumber}
                          </strong>
                        </p>
                        <p>
                          Address:{" "}
                          <strong className="text-gray-600">
                            {selectedCanceledBooking?.address}
                          </strong>
                        </p>

                        <p>
                          Booking Date:{" "}
                          <strong className="text-gray-600">
                            {selectedCanceledBooking?.date}
                          </strong>
                        </p>
                      </div>
                      <div className="w-1/2 flex flex-col gap-1">
                        <p>
                          Day of departure:{" "}
                          <strong className="text-gray-600">
                            {selectedCanceledBooking?.date}
                          </strong>
                        </p>
                        <p>
                          Time of departure:{" "}
                          <strong className="text-gray-600">
                            {selectedCanceledBooking?.time}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </section>
                  <LoadScriptNext
                    googleMapsApiKey={
                      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    }
                    loading="lazy"
                  >
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      zoom={14}
                      center={selectedCanceledBooking?.location}
                    >
                      <Marker position={selectedCanceledBooking?.location} />
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
                            {selectedCanceledBooking?.cartItems
                              ? new Intl.NumberFormat("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                  .format(
                                    selectedCanceledBooking.cartItems.reduce(
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
                        <tr className="text-gray-700 font-semibold">
                          <td className="py-2 px-4 border-b">Total</td>
                          <td className="py-2 px-4 border-b text-right">
                            ₹
                            {selectedCanceledBooking?.cartItems
                              ? new Intl.NumberFormat("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                  .format(
                                    selectedCanceledBooking.cartItems.reduce(
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

                  <section className="mb-8 mt-4">
                    <h3 className="text-xl font-bold text-red-600">Caution:</h3>
                    <ol className="list-decimal ml-6 mt-2 text-gray-700">
                      <li>Accept the booking as soon as possible.</li>
                      <li>Rejection cannot be undone later.</li>
                      <li>Verify OTP from the customer.</li>
                      <li>Attach an image of doing servicing</li>
                      <li>Update the status of service According to you!</li>
                      <li>
                        Generate an invoice after reviewing the customer problem
                        with the necessary details.
                      </li>
                    </ol>
                  </section>
                </div>
              </Dialog>
            </div>
          )}
          {serviceProviderCompletedBookings.length > 0 && (
            <div className="container mx-auto py-8 px-4 lg:px-0">
              <h2 className="text-2xl text-teal-500 font-semibold">
                Bookings history!
              </h2>
              <div className="h-px bg-gray-300 w-full my-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceProviderCompletedBookings.map((service, index) => (
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
                      className="px-4 py-2 bg-teal-500 text-white text-sm font-medium transition-all hover:bg-teal-600 flex items-center gap-1 justify-center"
                      onClick={() => {
                        handleOpenCompletedBookingDialog();
                        setSelectedCompletedBooking(service);
                      }}
                    >
                      View
                      <IoMdOpen />
                    </button>
                  </div>
                ))}
              </div>
              <Dialog
                open={openCompletedBookingDialog}
                handler={handleOpenCompletedBookingDialog}
                size="xl"
                animate={{
                  mount: { scale: 1, y: 0 },
                  unmount: { scale: 0.1, y: 500 },
                }}
                className="bg-gray-100 p-6"
              >
                <DialogHeader className="flex justify-between items-center p-0 mb-2 px-4">
                  <div className="font-julius text-2xl font-bold ">
                    Booking Details
                  </div>
                  <IconButton
                    variant="text"
                    onClick={handleOpenCompletedBookingDialog}
                  >
                    <RxCross1 size={20} />
                  </IconButton>
                </DialogHeader>
                <div className="max-h-[30rem] overflow-auto px-4">
                  <section className="mb-8">
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4">
                      {selectedCompletedBooking?.cartItems?.map((item) => {
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
                    <h3 className="text-blue-700 text-xl font-medium whitespace-nowrap">
                      Customer Information
                    </h3>
                    <div className=" flex flex-col gap-4 sm:flex-row justify-between">
                      <div className="w-1/2 flex flex-col gap-1">
                        <p>
                          Full Name:{" "}
                          <strong className="text-gray-600">
                            {selectedCompletedBooking?.fullname}
                          </strong>
                        </p>
                        <p>
                          Phone:{" "}
                          <strong className="text-gray-600">
                            +91 {selectedCompletedBooking?.phoneNumber}
                          </strong>
                        </p>
                        <p>
                          Address:{" "}
                          <strong className="text-gray-600">
                            {selectedCompletedBooking?.address}
                          </strong>
                        </p>

                        <p>
                          Booking Date:{" "}
                          <strong className="text-gray-600">
                            {selectedCompletedBooking?.date}
                          </strong>
                        </p>
                      </div>
                      <div className="w-1/2 flex flex-col gap-1">
                        <p>
                          Day of departure:{" "}
                          <strong className="text-gray-600">
                            {selectedCompletedBooking?.date}
                          </strong>
                        </p>
                        <p>
                          Time of departure:{" "}
                          <strong className="text-gray-600">
                            {selectedCompletedBooking?.time}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </section>
                  <LoadScriptNext
                    googleMapsApiKey={
                      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    }
                    loading="lazy"
                  >
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      zoom={14}
                      center={selectedCompletedBooking?.location}
                    >
                      <Marker position={selectedCompletedBooking?.location} />
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
                            {selectedCompletedBooking?.cartItems
                              ? new Intl.NumberFormat("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                  .format(
                                    selectedCompletedBooking.cartItems.reduce(
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
                        <tr className="text-gray-700 font-semibold">
                          <td className="py-2 px-4 border-b">Total</td>
                          <td className="py-2 px-4 border-b text-right">
                            ₹
                            {selectedCompletedBooking?.cartItems
                              ? new Intl.NumberFormat("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                                  .format(
                                    selectedCompletedBooking.cartItems.reduce(
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
                  {selectedCompletedBooking?.acceptedByServiceProvider && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                      {selectedCompletedBooking?.otpVerified ? (
                        <div className="bg-white rounded-lg shadow-md w-full min-h-44 p-4 flex items-center flex-col justify-center">
                          <div className="text-2xl font-julius text-teal-500 font-bold flex flex-col items-center gap-1">
                            <RiVerifiedBadgeFill size={75} /> OTP Verified
                          </div>
                        </div>
                      ): (
                        <div className="bg-white rounded-lg shadow-md w-full min-h-44 p-4 flex items-center flex-col justify-center">
                          <div className="text-2xl font-julius text-red-500 font-bold flex flex-col items-center gap-1">
                            <RiVerifiedBadgeFill size={75} /> OTP Not Verified
                          </div>
                        </div>
                      )}

                      <div className="bg-white flex justify-center items-center rounded-lg shadow-md w-full min-h-44 p-4">
                        <div className="flex gap-4 flex-col md:flex-row items-center justify-center">
                          <div className="flex justify-center">
                            <img
                              src={selectedCompletedBooking?.verificationImage?.url || "https://placehold.co/400"}
                              alt="Uploaded"
                              className="w-32 h-32 rounded-lg object-cover"
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
                      <li>Update the status of service According to you!</li>
                      <li>
                        Generate an invoice after reviewing the customer problem
                        with the necessary details.
                      </li>
                    </ol>
                  </section>
                </div>
              </Dialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceProviderBooking;
