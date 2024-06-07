"use client";
import Nav from "@/components/Nav";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { FaArrowDown } from "react-icons/fa";
import { Drawer, Rating, Textarea } from "@material-tailwind/react";
import {
  Button,
  Carousel,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { MdChevronLeft, MdChevronRight, MdDelete } from "react-icons/md";
import { FaCartArrowDown } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import Link from "next/link";
import { VscDebugContinue } from "react-icons/vsc";
import { IoBagRemove } from "react-icons/io5";
import { IoIosStar, IoIosStarHalf, IoIosStarOutline } from "react-icons/io";
import axios from "axios";

const NextArrow = ({ onClick }) => {
  return (
    <div
      className="absolute top-1/2 transform -translate-y-1/2 right-0 bg-gray-700 text-white rounded-full p-2 cursor-pointer z-10"
      onClick={onClick}
    >
      <MdChevronRight className="w-6 h-6" />
    </div>
  );
};

const PrevArrow = ({ onClick }) => {
  return (
    <div
      className="absolute top-1/2 transform -translate-y-1/2 left-0 bg-gray-700 text-white rounded-full p-2 cursor-pointer z-10"
      onClick={onClick}
    >
      <MdChevronLeft className="w-6 h-6" />
    </div>
  );
};

const sliderSettings = {
  // dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        // dots: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

const ReviewCard = ({ name, review, rating, image }) => (
  <div className="w-full p-2 h-full">
    <div className="bg-white p-4 h-full shadow rounded-lg flex items-start space-x-4">
      <div className="relative w-12 h-12">
        <img
          src={image?.url}
          alt={name}
          className="rounded-full object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex">
              {Array.from({ length: 5 }, (e, index) => {
                let stars = rating;
                return (
                  <span key={index} className="text-[#FFB800]">
                    {stars >= index + 1 ? (
                      <IoIosStar size={15} />
                    ) : stars >= index + 0.5 ? (
                      <IoIosStarHalf size={15} />
                    ) : (
                      <IoIosStarOutline size={15} />
                    )}
                  </span>
                );
              })}
            </div>
            <h3 className="font-bold">{name}</h3>
          </div>
        </div>
        <p className="text-gray-600">{review}</p>
      </div>
    </div>
  </div>
);
const Service = () => {
  const { id } = useParams();

  const [service, setService] = useState({});
  const getService = async () => {
    try {
      const res = await fetch(`/api/services/${id}`);
      const data = await res.json();
      setService(data);
    } catch (err) {
      console.log(err);
    }
  };

  const [cartItems, setCartItems] = useState([]);
  const [open, setOpen] = useState(false);

  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);
  const handleAddingCart = (subService) => {
    const existingItem = cartItems.find((item) => item._id === subService._id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item._id === subService._id // Use _id here
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...subService, quantity: 1 }]);
      localStorage.setItem(
        "cart",
        JSON.stringify([...cartItems, { ...subService, quantity: 1 }])
      );
      openDrawer();
    }
  };
  const removingCartItem = (id) => {
    setCartItems(cartItems.filter((item) => item._id !== id));

    localStorage.setItem(
      "cart",
      JSON.stringify(cartItems.filter((item) => item._id !== id))
    );
    if (cartItems.length == 1) closeDrawer();
  };
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getService();
    setCartItems(JSON.parse(localStorage.getItem("cart")) || []);
    setLoading(false);
  }, []);

  const [review, setReview] = useState({
    name: "",
    image: {
      url: "",
      name: "",
    },
    review: "",
    rating: 0,
  });
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    // Assuming you have an endpoint to submit a review
    try {
      const userId = localStorage.getItem("token");
      const response = await axios.get(`/api/users/${userId}`);
      const fetchedUser = await response.data;

      const updatedReview = {
        ...review,
        name: fetchedUser.name,
        image: fetchedUser.image,
      };
      const updatedService = {
        ...service,
        reviews: [...service.reviews, updatedReview],
      };
      const res = await axios.post(
        `/api/services/${id}/update`,
        updatedService
      );
      if (res.status === 201) {
        // Add the new review to the existing reviews
        setService(updatedService);
        // Reset the new review form
        setReview({
          image: {
            url: "",
            name: "",
          },
          name: "",
          review: "",
          rating: 0,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const [ratingArray, setRatingArray] = useState([]);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    setRatingArray((prev) => {
      return prev.concat(service?.reviews?.map((review) => review.rating));
    });
  }, [service]);
  useEffect(() => {
    const countRatings = ratingArray.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    const {
      1: r1 = 0,
      2: r2 = 0,
      3: r3 = 0,
      4: r4 = 0,
      5: r5 = 0,
    } = countRatings;

    const result =
      (5 * r5 + 4 * r4 + 3 * r3 + 2 * r2 + 1 * r1) / (r5 + r4 + r3 + r2 + r1);

    setRating(result.toFixed(1));
  }, [ratingArray]);

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
        <Drawer
          open={open}
          onClose={closeDrawer}
          className="p-4 shadow-lg overflow-auto"
          dismiss={{ enabled: false }}
          overlay={false}
          size={420}
          placement="right"
        >
          <div className="mb-6 flex items-center justify-between">
            <Typography variant="h5" color="blue-gray">
              Cart Services
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
          <div className="flex flex-col gap-4">
            {cartItems.map((item) => {
              return (
                <div key={item._id} className="flex items-center gap-2">
                  <img
                    src={item.icon?.url} // Replace with actual path
                    alt="Service Icon"
                    className="w-28 h-28 object-cover rounded shadow"
                  />
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl leading-tight text-gray-700 font-bold w-full">
                      {item.name}
                    </h2>
                    <Typography color="teal" variant="h5">
                      ₹{item.price}
                    </Typography>
                    <Button
                      onClick={() => removingCartItem(item._id)}
                      color="red"
                      variant="gradient"
                      size="sm"
                      className="rounded w-fit flex items-center gap-1"
                    >
                      Remove <IoBagRemove />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="lg"
              variant="outlined"
              className="rounded flex items-center gap-1"
              onClick={closeDrawer}
            >
              Continue Browsing <VscDebugContinue />
            </Button>
            <Link href={"/cart"}>
              <Button
                size="lg"
                color="gray"
                variant="gradient"
                className="rounded flex items-center gap-1"
              >
                Cart <FaCartShopping />
              </Button>
            </Link>
          </div>
        </Drawer>
        <div className="px-4 md:px-20 my-6 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className="w-full lg:w-2/3 p-4 flex flex-col justify-center gap-6 rounded-lg">
              <div className="flex items-center gap-2">
                <img
                  src={service.icon?.url} // Replace with actual path
                  alt="Service Icon"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex flex-col gap-2 justify-center">
                  <h2 className="lg:text-4xl md:text-5xl sm:text-5xl  text-4xl leading-tight text-gray-700 font-bold  ">
                    {service.name}
                  </h2>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <div className="flex">
                        {Array.from({ length: 5 }, (e, index) => {
                          let stars = rating;
                          return (
                            <span key={index} className="text-[#FFB800]">
                              {stars >= index + 1 ? (
                                <IoIosStar size={15} />
                              ) : stars >= index + 0.5 ? (
                                <IoIosStarHalf size={15} />
                              ) : (
                                <IoIosStarOutline size={15} />
                              )}
                            </span>
                          );
                        })}
                      </div>
                      <span className="ml-1">{rating}</span>
                    </div>
                    <span className="ml-2 text-gray-700">
                      | {service?.reviews?.length} reviews
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-center  ">
                <div className="whitespace-nowrap text-sm">
                  Reviews & Bookings
                </div>
                <div className="h-px bg-gray-300 w-full"></div>
              </div>
              <div className="flex items-start gap-6 ">
                <div className="flex flex-col w-full items-center gap-2 bg-white h-fit  shadow-lg rounded-lg p-4 cursor-pointer hover:scale-105 transition-all">
                  <img
                    src="/icons/cargo.png" // Replace with actual path
                    alt="Bookings Icon"
                    className="w-20 object-cover"
                  />
                  <span className="text-gray-600 text-xl">
                    {service?.bookings?.length} Bookings
                  </span>
                </div>
                <div className="flex flex-col w-full items-center gap-2 bg-white h-fit  shadow-lg rounded-lg p-4 cursor-pointer hover:scale-105 transition-all">
                  <img
                    src="/icons/star.png" // Replace with actual path
                    alt="Star Icon"
                    className="w-20 object-cover"
                  />
                  <span className="text-gray-600 text-xl">
                    {rating} | {service?.reviews?.length} reviews
                  </span>
                </div>
              </div>
            </div>

            <Carousel
              className="rounded-md w-full max-h-auto overflow-hidden"
              loop
              prevArrow={({ handlePrev }) => (
                <IconButton
                  variant="text"
                  color="white"
                  size="lg"
                  onClick={handlePrev}
                  className="!absolute top-2/4 left-4 -translate-y-2/4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                </IconButton>
              )}
              nextArrow={({ handleNext }) => (
                <IconButton
                  variant="text"
                  color="white"
                  size="lg"
                  onClick={handleNext}
                  className="!absolute top-2/4 !right-4 -translate-y-2/4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </IconButton>
              )}
            >
              {service.images?.map((image) => {
                return (
                  <img
                    key={image.name}
                    src={image.url}
                    alt=""
                    className="h-96 w-full object-cover"
                  />
                );
              })}
            </Carousel>
          </div>
          <div className="w-full flex flex-col justify-center items-center py-4 px-4">
            <h1 className="font-julius lg:text-5xl md:text-4xl sm:text-3xl text-3xl text-center text-gray-700 font-bold">
              {service.name}
            </h1>
          </div>
          <div className="container mx-auto">
            {service.subServices?.length <= 4 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center">
                {service.subServices?.map((subService, index) => (
                  <Card className="mb-3 max-w-72" key={index}>
                    <CardHeader floated={false}>
                      <img
                        src={subService.icon?.url}
                        alt="Service Icon"
                        className="object-cover w-64 h-48 shadow-lg"
                      />
                    </CardHeader>
                    <CardBody>
                      <div className="mb-1 flex flex-col justify-start gap-2">
                        <div>
                          <span
                            className={`border ${
                              subService.status === "active"
                                ? "bg-teal-100"
                                : "bg-red-100"
                            } text-xs ${
                              subService.status === "active"
                                ? "text-teal-700"
                                : "text-red-700"
                            } px-2 py-1 rounded-full`}
                          >
                            {subService.status}
                          </span>
                        </div>
                        <Typography
                          variant="h6"
                          color="blue-gray"
                          className="font-medium"
                        >
                          {subService.name}
                        </Typography>
                      </div>
                      <div className="text-2xl font-bold text-teal-500">
                        ₹{subService.price}
                      </div>
                    </CardBody>
                    <CardFooter className="pt-0 flex flex-col gap-2">
                      {cartItems.some((sub) => sub._id === subService._id) ? (
                        <Button
                          size="lg"
                          fullWidth={true}
                          variant="gradient"
                          color="red"
                          className="flex gap-2 items-center justify-center"
                          onClick={() => removingCartItem(subService._id)}
                        >
                          <span>Remove Service</span>
                          <IoBagRemove size={20} />
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          fullWidth={true}
                          variant="gradient"
                          color="indigo"
                          className="flex gap-2 items-center justify-center"
                          onClick={() => handleAddingCart(subService)}
                        >
                          <span>Add to cart</span>
                          <FaCartArrowDown size={20} />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Slider {...sliderSettings}>
                {service.subServices?.map((subService, index) => (
                  <div key={index} className="px-3">
                    <Card className="mb-3">
                      <CardHeader floated={false}>
                        <img
                          src={subService.icon.url}
                          alt="Service Icon"
                          className="object-cover w-64 h-48 shadow-lg"
                        />
                      </CardHeader>
                      <CardBody>
                        <div className="mb-1 flex flex-col justify-start gap-2">
                          <Typography
                            variant="h6"
                            color="blue-gray"
                            className="font-medium"
                          >
                            {subService.name}
                          </Typography>
                        </div>
                        <div className="text-2xl font-bold text-teal-500">
                          ₹{subService.price}
                        </div>
                      </CardBody>
                      <CardFooter className="pt-0 flex flex-col gap-2">
                        {cartItems.some((sub) => sub._id === subService._id) ? (
                          <Button
                            size="lg"
                            fullWidth={true}
                            variant="gradient"
                            color="red"
                            className="flex gap-2 items-center justify-center"
                            onClick={() => removingCartItem(subService._id)}
                          >
                            <span>Remove Service</span>
                            <IoBagRemove size={20} />
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            fullWidth={true}
                            variant="gradient"
                            color="indigo"
                            className="flex gap-2 items-center justify-center"
                            onClick={() => handleAddingCart(subService)}
                          >
                            <span>Add to cart</span>
                            <FaCartArrowDown size={20} />
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </Slider>
            )}
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 ">
          <div className="flex items-center md:flex-row flex-col justify-between mb-4">
            <h2 className="text-2xl font-julius font-bold mb-4">
              Reviews by users
            </h2>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: 5 }, (e, index) => {
                    let stars = rating;
                    return (
                      <span key={index} className="text-[#FFB800]">
                        {stars >= index + 1 ? (
                          <IoIosStar size={15} />
                        ) : stars >= index + 0.5 ? (
                          <IoIosStarHalf size={15} />
                        ) : (
                          <IoIosStarOutline size={15} />
                        )}
                      </span>
                    );
                  })}
                </div>
                <span className="ml-1">{rating}</span>
              </div>
              <span className="ml-2 text-gray-700">
                | {service?.reviews?.length} reviews
              </span>
            </div>
          </div>
          <div className="overflow-auto h-96 no-scrollbar">
            <div className="flex flex-wrap m-2 h-full">
              {service?.reviews?.length === 0 ? (
                <div className="w-full h-full flex gap-2 flex-col justify-center items-center">
                  <div className="font-julius text-2xl">
                    Uh oh, There is no review yet.
                  </div>
                  <div className="flex gap-1 items-center text-gray-700">
                    Make sure to give a review, if you liked {service.name}{" "}
                    <FaArrowDown />
                  </div>
                </div>
              ) : (
                <div className="w-full grid grid-cols-2 gap-4">
                  {service.reviews?.map((review, index) => (
                    <div key={index} className="w-full h-full">
                      <ReviewCard key={review.id} {...review} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center bg-gray-100 ">
          <div className="w-9/12 mb-8">
            <div className="p-4 bg-white shadow rounded-lg space-x-4">
              <h3 className="text-2xl text-blue-500 font-semibold mb-4 text-center">
                Give a Review
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <label className="block text-lg font-medium text-gray-700">
                    Rating
                  </label>
                  <Rating
                    value={review.rating}
                    required
                    onChange={(e) => setReview({ ...review, rating: e })}
                  />
                </div>
                <Textarea
                  label="Message"
                  color="blue-gray"
                  value={review.review}
                  onChange={(e) =>
                    setReview({ ...review, review: e.target.value })
                  }
                  required
                  rows="5"
                />
                <div className="flex justify-end">
                  <Button type="submit" color="blue">
                    Submit Review
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Service;
