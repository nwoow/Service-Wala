"use client";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { IoMdInformationCircleOutline } from "react-icons/io";
import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemPrefix,
  Radio,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import Link from "next/link";
import { MdOutlineMyLocation } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { SiPhonepe } from "react-icons/si";
import { Player } from "@lottiefiles/react-lottie-player";
import { useRouter } from "next/navigation";
import axios from "axios";

function Shipping() {
  const [formData, setFormData] = useState({
    fullname: "",
    profileImage: {},
    phoneNumber: "",
    address: "",
    date: "",
    time: 0,
  });

  const [dates, setDates] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // Create handler functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to generate the four days including the current date
  const getFourDays = () => {
    const today = new Date();
    const fourDaysArray = [today];

    for (let i = 1; i < 4; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      fourDaysArray.push(nextDate);
    }

    return fourDaysArray.map((date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${parseFloat(hours) + 1}:${parseFloat(minutes)}`;
  };

  const getAddress = async () => {
    try {
      let location = JSON.parse(localStorage.getItem("location"));

      if (!location) {
        if (navigator.geolocation) {
          location = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation = { lat: latitude, lng: longitude };
                localStorage.setItem("location", JSON.stringify(newLocation));
                resolve(newLocation);
              },
              (error) => {
                console.error("Error getting the location:", error);
                alert("Please enable geolocation to use this feature.");
                reject(error);
              }
            );
          });
        } else {
          throw new Error("Geolocation is not supported by this browser.");
        }
      }

      const { lat, lng } = location;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          address: data.results[0].formatted_address,
        }));
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          address: "Address not found",
        }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setFormData((prevFormData) => ({
        ...prevFormData,
        address: "Error fetching address",
      }));
    }
  };
  const [user, setUser] = useState({});
  const gettingUser = async () => {
    try {
      const id = localStorage.getItem("token");
      const response = await axios.get(`/api/users/${id}`);
      const data = await response.data;
      setUser(data);

      setFormData((prevFormData) => ({
        ...prevFormData,
        fullname: data.name || "Name",
        profileImage: data.image || { url: "", name: "" },
        phoneNumber: data.phoneNumber || "Phone Number",
        email: data.email || "Email",
      }));
    } catch (err) {
      console.log(err);
    }
  };
  const router = useRouter();
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) router.back();
    setCartItems(cart);
    gettingUser();
    const dates = getFourDays();
    setDates(dates);
    getAddress();

    // Set the initial date in formData
    setFormData((prevFormData) => ({
      ...prevFormData,
      date: dates[0],
    }));
  }, []);

  const [paymentDailog, setPaymentDailog] = useState(false);
  const handlePaymentDailog = () => setPaymentDailog(!paymentDailog);

  const [completedDailog, setCompletedDailog] = useState(false);
  const handleCompletedDailog = () => setCompletedDailog(!completedDailog);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.time <= getCurrentTime()) {
      alert("Please select a time after 1 hour of the current time at least.");
      return;
    }
    handlePaymentDailog();
  };
  function generateOTP() {
    // Generate a random number between 1000 and 9999
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString();
  }
  const handleSumbitOrderViaCash = async () => {
    handleCompletedDailog();
    const location = JSON.parse(localStorage.getItem("location"));
    const otp = generateOTP();
    const postData = {
      ...formData,
      paymentMethod: "Via Cash",
      location,
      cartItems,
      status: false,
      otp,
    };

    try {
      const response = await axios.post("/api/bookings/add", postData);
      const updatedUser = {
        ...user,
        bookings: [...user.bookings, response.data._id],
      };
      await axios.post("/api/users/update", updatedUser);
      gettingUser();
      const res = await axios.post(`/api/services/update-bookings`, {
        cartItems,
        orderId: response.data._id,
      });
      localStorage.removeItem("cart");
    } catch (error) {
      console.error(`Error updating service ${serviceId}:`, error);
    }

    // const promises = cartItems.map(async (item) => {
    //   const serviceId = item.serviceId;
    //   const updatedItem = {
    //     ...item,
    //     bookings: [
    //       ...item.bookings,
    //       { orderId: response.data._id, subService: item },
    //     ],
    //   };

    //   // Remove _id field from updatedItem if it exists
    //   const { _id, ...restUpdatedItem } = updatedItem;

    //   try {
    //     return await axios.post(`/api/services/${serviceId}/update`, restUpdatedItem);
    //   } catch (error) {
    //     console.error(`Error updating service ${serviceId}:`, error);
    //   }
    // });

    // const results = await Promise.all(promises);
    // results.forEach((res) => console.log(res));
  };

  return (
    <div>
      <Nav />
      <div className="flex flex-col md:flex-row justify-center gap-20 p-8">
        <div className="w-full md:w-1/3">
          <h2 className="font-julius lg:text-4xl md:text-4xl sm:text-3xl text-3xl mb-4 text-gray-700">
            SUMMARY
          </h2>
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="flex items-center">
                <img
                  src={item.icon?.url}
                  alt="Product"
                  className="w-24 h-24 mr-3 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm">Qty: {item.quantity}</p>
                  <p className="text-sm font-bold text-teal-500">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="h-px w-full bg-gray-300 mt-4"></div>

          <div className="flex flex-col gap-4 p-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                ₹
                {cartItems
                  .reduce(
                    (acc, product) => acc + product.price * product.quantity,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Convenience Fee</span>
              <span>₹18.00</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-700">
              <span>Total</span>
              <span>
                ₹
                {(
                  cartItems.reduce(
                    (acc, product) => acc + product.price * product.quantity,
                    0
                  ) + 18
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="font-julius text-center lg:text-4xl md:text-4xl sm:text-3xl text-3xl mb-4 text-gray-700">
            Checkout
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              className="bg-white"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              maxLength={30}
              minLength={4}
            />
            <Input
              label="Phone number"
              className="bg-white"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              maxLength={10}
              minLength={10}
            />
            <div className="relative">
              <Textarea
                label="Address"
                className="bg-white"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                minLength={4}
              />
              <Link href={"/location"} className="absolute bottom-4 right-3">
                <Button
                  size="sm"
                  color="deep-orange"
                  variant="gradient"
                  className="flex gap-1 rounded-md items-center"
                >
                  Change address <MdOutlineMyLocation size={18} />
                </Button>
              </Link>
            </div>
            <h2>Available Dates</h2>
            <List className="grid grid-cols-2 2xl:grid-cols-4 bg-white rounded-lg">
              {dates.map((date) => (
                <ListItem key={date} className="p-0">
                  <label
                    htmlFor={date}
                    className="flex w-full cursor-pointer items-center px-3 py-2"
                  >
                    <ListItemPrefix className="mr-3">
                      <Radio
                        name="date"
                        value={date}
                        onChange={handleChange}
                        checked={formData.date === date}
                        id={date}
                        ripple={false}
                        required
                        className="hover:before:opacity-0"
                        containerProps={{
                          className: "p-0",
                        }}
                      />
                    </ListItemPrefix>
                    <Typography
                      color="blue-gray"
                      className="font-medium text-blue-gray-400"
                    >
                      {date}
                    </Typography>
                  </label>
                </ListItem>
              ))}
            </List>
            <input
              type="time"
              name="time"
              value={formData.time}
              required
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <IoMdInformationCircleOutline size={20} />
              <p className="text-xs">
                Your privacy is important to us. We will only contact you if
                there is an issue with your order.
              </p>
            </div>
            <button
              className="w-full bg-gray-700 transition-all hover:bg-gray-800 text-white p-2 rounded mt-4"
              type="submit"
            >
              Continue to payements
            </button>
            <Dialog
              size="sm"
              open={paymentDailog}
              handler={handlePaymentDailog}
              dismiss={{ enabled: false }}
              className="p-6 bg-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <Typography variant="h5" className="text-gray-700">
                  Payment Options
                </Typography>
                <IconButton variant="text" onClick={handlePaymentDailog}>
                  <RxCross1 size={20} />
                </IconButton>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 justify-between cursor-pointer bg-white hover:scale-105 transition-all shadow-lg border px-4 py-6 rounded-lg">
                  <div className="font-medium text-xl font-itim text-indigo-500">
                    Pay with phone pay / UPi
                  </div>
                  <div className="flex items-center gap-2">
                    <SiPhonepe size={30} color="#6739b7" />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg"
                      className="w-16 object-cover"
                    />
                  </div>
                </div>
                <div
                  onClick={handleSumbitOrderViaCash}
                  className="flex items-center gap-2 justify-between cursor-pointer bg-white hover:scale-105 transition-all shadow-lg border p-4 rounded-lg"
                >
                  <div className="font-medium text-xl font-itim text-indigo-500">
                    Pay with cash
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src="/icons/payment.png"
                      className="w-12 object-cover"
                    />
                  </div>
                </div>
                <Dialog
                  open={completedDailog}
                  handler={handleCompletedDailog}
                  dismiss={{ enabled: false }}
                  className="p-3 bg-gray-100"
                  size="xs"
                >
                  <div className="flex justify-center items-center">
                    <Typography
                      variant="h5"
                      className="text-teal-500 text-center"
                    >
                      Service Booked Successfully
                    </Typography>
                  </div>
                  <Player
                    autoplay
                    // loop
                    keepLastFrame={true}
                    src="/lottie/tick1.json"
                  ></Player>
                  <Link href={"/booking"}>
                    <Button
                      fullWidth
                      color="teal"
                      variant="gradient"
                      className="flex gap-1 transition-all hover:gap-2 items-center justify-center"
                    >
                      Go to Bookings
                    </Button>
                  </Link>
                </Dialog>
              </div>
            </Dialog>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Shipping;
