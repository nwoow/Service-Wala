"use client";
import React, { useRef } from "react";
import Nav from "@/components/Nav";
import { useState, useEffect } from "react";
import { FaArrowLeft, FaHistory } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import { Rating } from "@material-tailwind/react";
import Image from "next/image";
import {
  Button,
  Dialog,
  Input,
  DialogFooter,
  Select,
  Option,
  Badge,
  Avatar,
  ListItem,
  ListItemSuffix,
  IconButton,
  Checkbox,
  ListItemPrefix,
  Typography,
} from "@material-tailwind/react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/firebase";
import { IoSettings } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Footer from "@/components/Footer";
import ServiceProviderLocation from "@/components/ServiceProviderLocation";

const reviews = [
  {
    id: 1,
    name: "Musharraf Jamal",
    review: "Service provider were soo delicate to his work.",
    rating: 4,
    img: "/image/hero1.webp", // Replace with the path to your first image
  },
  {
    id: 2,
    name: "Angila",
    review: "Good in work but behavior is not friendly at all.",
    rating: 3,
    img: "/image/hero1.webp", // Replace with the path to your second image
  },
  {
    id: 3,
    name: "Angila",
    review: "Good in work but behavior is not friendly at all.",
    rating: 3,
    img: "/image/hero1.webp", // Replace with the path to your second image
  },
  {
    id: 4,
    name: "Musharraf Jamal",
    review: "Service provider were soo delicate to his work.",
    rating: 4,
    img: "/image/hero1.webp", // Replace with the path to your first image
  },
  {
    id: 5,
    name: "Musharraf Jamal",
    review: "Service provider were soo delicate to his work.",
    rating: 4,
    img: "/image/hero1.webp", // Replace with the path to your first image
  },
  {
    id: 6,
    name: "Musharraf Jamal",
    review: "Service provider were soo delicate to his work.",
    rating: 4,
    img: "/image/hero1.webp", // Replace with the path to your first image
  },
  {
    id: 7,
    name: "Musharraf Jamal",
    review: "Service provider were soo delicate to his work.",
    rating: 4,
    img: "/image/hero1.webp", // Replace with the path to your first image
  },
  {
    id: 8,
    name: "Musharraf Jamal",
    review:
      "Service provider were soo delicate to his work.Service provider were soo delicate to his work.Service provider were soo delicate to his work.Service provider were soo delicate to his work.",
    rating: 4,
    img: "/image/hero1.webp", // Replace with the path to your first image
  },
  {
    id: 9,
    name: "Musharraf Jamal",
    review: "Service provider were soo delicate to his work.",
    rating: 4,
    img: "/image/hero1.webp", // Replace with the path to your first image
  },
];
const ReviewCard = ({ name, review, rating, img }) => (
  <div className="w-full md:w-1/2 p-2">
    <div className="bg-white p-4 h-52 shadow rounded-lg flex items-start space-x-4">
      <div className="relative w-12 h-12">
        <Image
          src={img}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold">{name}</h3>
            <div className="flex items-center">
              <Rating value={4} />
            </div>
          </div>
        </div>
        <p className="text-gray-600">{review}</p>
      </div>
    </div>
  </div>
);

const ServiceProvider = () => {
  const { id } = useParams();
  const [user, setUser] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    image: {
      url: "",
      name: "",
    },
    gender: "",
    locations: "",
    city: "",
    active: "",
    role: "",
    serviceHistory: "",
  });
  const [allServices, setAllServices] = useState([]);
  const [UpdatedServices, setUpdatedServices] = useState([]);

  const [updateUser, setUpdateUser] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    image: {
      url: "",
      name: "",
    },
    gender: "",
    locations: "",
    city: "",
    active: "",
    role: "",
    serviceHistory: "",
    services: [],
  });
  const gettingUser = async () => {
    const response = await fetch(
      `/api/service-providers/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      { cache: "no-store" }
    );
    const data = await response.json();
    setUser(data);
  };

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
  }
  const formattedDate = formatDate(updateUser.createdAt);
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
  };
  const [open2, setOpen2] = useState(false);
  const handleOpen2 = () => {
    setOpen2(!open2);
  };

  const [profileUploaded, setProfileUploaded] = useState(true);
  const handleUploadProfile = async (profileImage) => {
    setProfileUploaded(false);
    try {
      if (!profileImage) {
        alert("Invalid Image");
        return;
      }
      if (updateUser.image.url) {
        await deleteObject(ref(storage, updateUser.image.name));
      }
      const imageRef = ref(
        storage,
        `service-provider/${
          profileImage.lastModified + profileImage.size + profileImage.name
        }`
      );
      await uploadBytes(imageRef, profileImage);
      const imageUrl = await getDownloadURL(imageRef); // Get the profileImage URL directly
      const imageObject = {
        url: imageUrl,
        name: imageRef._location.path_,
      };
      await fetch(`/api/service-providers/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updateUser,
          image: imageObject,
        }),
      });
      setUpdateUser({ ...updateUser, image: imageObject });
      setProfileUploaded(true);
      // console.log({ imageUrl, imageRef: imageRef._location.path_ });
    } catch (err) {
      console.error(err);
    }
  };
  const handleUpdate = async () => {
    const response = await fetch(`/api/service-providers/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...updateUser }),
    });
    gettingUser();
    if (response.ok) {
      setOpen(false);
    }
  };
  useEffect(() => {
    setUpdateUser({ ...user });
    setUpdatedServices(user?.services);
  }, [user]);
  const getAllService = async () => {
    const response = await fetch("/api/services", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setAllServices(data);
  };
  const filteringServices = () => {
    if (UpdatedServices && UpdatedServices.length > 0) {
      const filteredServices = allServices.filter((e) => {
        const updatedService = UpdatedServices.find(
          (updated) => updated._id === e._id
        );
        return !updatedService;
      });
      setAllServices(filteredServices);
    }
  };
  const handleUpdateServices = async () => {
    const response = await fetch(`/api/service-providers/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...updateUser,
        services: UpdatedServices,
      }),
    });
    filteringServices();
    if (response.ok) {
      setOpen2(false);
    }
  };
  const handleDeleteService = async (ServiceId) => {
    const deletedServicesFiltered = UpdatedServices.filter(
      (e) => e._id !== ServiceId
    );
    const filteredServiceProvider = {
      ...updateUser,
      services: deletedServicesFiltered,
    };
    setUpdatedServices(deletedServicesFiltered);
    const response = await fetch(`/api/service-providers/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filteredServiceProvider),
    });
    if (response.ok) {
      filteringServices();
      setOpen2(false);
    }
  };

  useEffect(() => {
    filteringServices();
  }, [updateUser]);
  useEffect(() => {
    gettingUser();
    getAllService();
  }, []);
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
    if (data.role !== "service-provider") {
      window.location.href = "/";
    }
  };
  const [loading, setLoading] = useState(true);
  const loadingFunction = async () => {
    await chechingAuthorization();
    await getAllService();
    await gettingUser();
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
          <div className="flex min-h-full flex-col justify-center items-center">
            <div className="w-10/12 mb-4">
              <button
                title="Go Back"
                className="flex gap-1 font-semibold text-gray-700 items-center my-10"
                onClick={router.back}
              >
                <FaArrowLeft /> Profile
              </button>
              <div className="flex flex-col justify-center gap-4">
                <div className="flex gap-4 items-center w-full">
                  {updateUser?.image?.url || user?.image?.url ? (
                    <Badge
                      content={<div className="h-3 w-h-3"></div>}
                      overlap="circular"
                      className="bg-gradient-to-tr from-green-400 to-green-600 border-2 border-white shadow-lg shadow-black/20"
                    >
                      <Avatar
                        src={updateUser?.image.url || user?.image.url}
                        alt="profile picture"
                        className="w-32 h-32 object-cover"
                      />
                    </Badge>
                  ) : (
                    <span className="bg-gray-700 h-32 w-32 font-junge text-white font-bold text-7xl flex justify-center items-center rounded-full">
                      {user?.name && Array.from(user.name)[0].toUpperCase()}
                    </span>
                  )}
                  <div className="flex gap-1 flex-col justify-center">
                    <span className="text-6xl font-semibold text-gray-800">
                      Hey👋
                    </span>
                    <span className="text-indigo-500 font-semibold text-3xl font-itim tracking-wider">
                      {user?.name}
                    </span>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-4">
                  <div className="flex items-center md:flex-row flex-col  justify-between w-full">
                    <div className="flex items-center md:flex-row flex-col  gap-4 w-full">
                      <div className="bg-red-100 px-4 py-2 text-red-800 rounded-md w-fit flex items-center gap-10">
                        <div className="flex items-center gap-1 w-full">
                          <FaHistory />
                          <span>Pending Payment</span>
                        </div>
                        <span>₹450</span>
                      </div>
                      <div className="bg-teal-100 px-4 py-2 text-teal-800 rounded-md w-fit flex items-center gap-10">
                        <div className="flex items-center gap-1">
                          <FaHistory />
                          <span>Lifetime Earning</span>
                        </div>
                        <span>₹6200</span>
                      </div>
                    </div>
                    <button
                      onClick={handleOpen}
                      className="px-4 py-2 mt-3 whitespace-nowrap bg-gray-800 text-white font-bold rounded shadow"
                    >
                      Edit Profile
                    </button>
                    <Dialog
                      open={open}
                      handler={handleOpen}
                      size="lg"
                      animate={{
                        mount: { scale: 1, y: 0 },
                        unmount: { scale: 0.9, y: -100 },
                      }}
                    >
                      <h2 className="text-center font-semibold text-gray-700 text-2xl pt-6">
                        Edit Profile
                      </h2>
                      <div className="p-6 flex gap-4 items-center h-full">
                        <div className="flex flex-col gap-4 w-full">
                          <Input
                            onChange={(e) =>
                              setUpdateUser({
                                ...updateUser,
                                name: e.target.value,
                              })
                            }
                            value={updateUser.name}
                            label="Fullname"
                          />
                          <Input
                            onChange={(e) =>
                              setUpdateUser({
                                ...updateUser,
                                phoneNumber: e.target.value,
                              })
                            }
                            value={updateUser.phoneNumber}
                            label="Phone Number"
                          />
                          <Input
                            onChange={(e) =>
                              setUpdateUser({
                                ...updateUser,
                                email: e.target.value,
                              })
                            }
                            value={updateUser.email}
                            label="Email"
                          />
                          <Select
                            label="Gender"
                            value={updateUser.gender}
                            onChange={(val) =>
                              setUpdateUser({
                                ...updateUser,
                                gender: val,
                              })
                            }
                          >
                            <Option value="unspecified">Unspecified</Option>
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                          </Select>
                          <Input
                            onChange={(e) =>
                              setUpdateUser({
                                ...updateUser,
                                city: e.target.value,
                              })
                            }
                            value={updateUser.city}
                            label="City"
                          />
                        </div>
                        <figure className="relative h-72 w-3/5 rounded-md">
                          {updateUser?.image?.url || user?.image?.url ? (
                            <img
                              className="h-full w-full rounded-xl object-cover object-center"
                              src={updateUser?.image?.url || user?.image?.url}
                              alt="Profile image"
                            />
                          ) : (
                            <div className="bg-gray-700 h-full w-full font-junge text-white font-bold text-7xl flex justify-center items-center rounded-xl">
                              {user?.name &&
                                Array.from(user?.name)[0].toUpperCase()}
                            </div>
                          )}

                          <label
                            className="w-full h-full text-center cursor-pointer"
                            htmlFor="profile"
                          >
                            <figcaption className="absolute bottom-4 left-2/4 flex w-[calc(100%-4rem)] -translate-x-2/4 justify-center rounded-lg text-gray-700 font-medium border border-white bg-white/75 py-4 px-6 shadow-lg shadow-black/5 saturate-200 backdrop-blur-sm">
                              Change Profile Image
                              <input
                                type="file"
                                className="hidden"
                                id="profile"
                                onChange={(e) => {
                                  handleUploadProfile(e.target.files[0]);
                                }}
                              />
                            </figcaption>
                          </label>
                        </figure>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="text"
                          color="red"
                          onClick={handleOpen}
                          className="mr-1"
                        >
                          <span>Cancel</span>
                        </Button>
                        <Button
                          variant="gradient"
                          color="green"
                          loading={!profileUploaded}
                          onClick={handleOpen}
                        >
                          <span onClick={handleUpdate}>Update</span>
                        </Button>
                      </DialogFooter>
                    </Dialog>
                  </div>
                  <div className="flex flex-col shadow-lg gap-6 w-full h-full bg-white rounded-md px-6 py-4 border border-gray-400">
                    <div className="flex justify-between w-full">
                      <div>Phone Number</div>
                      <div>{user?.phoneNumber}</div>
                    </div>
                    <div className="bg-gray-300 h-px w-full"></div>
                    <div className="flex justify-between w-full">
                      <div>Email</div>
                      <div>{user?.email}</div>
                    </div>
                    <div className="bg-gray-300 h-px w-full"></div>
                    <div className="flex justify-between w-full">
                      <div>Gender</div>
                      <div>{user?.gender}</div>
                    </div>
                    <div className="bg-gray-300 h-px w-full"></div>
                    <div className="flex justify-between w-full">
                      <div>City</div>
                      <div>{user?.city}</div>
                    </div>
                    <div className="bg-gray-300 h-px w-full"></div>
                    <div className="flex justify-between w-full">
                      <div>Account Crated on</div>
                      <div>{formattedDate}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center md:flex-row flex-col justify-between w-full">
                  <h1 className="flex items-center gap-1 text-2xl md:flex-row    font-bold text-gray-700">
                    <IoSettings size={30} /> Services You Provide
                  </h1>
                  <button
                    onClick={handleOpen2}
                    className="px-4 py-2 whitespace-nowrap bg-gray-800 text-white font-bold rounded shadow"
                  >
                    Add New Service
                  </button>
                  <Dialog
                    open={open2}
                    handler={handleOpen2}
                    size="lg"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0.9, y: -100 },
                    }}
                  >
                    <h2 className="text-center font-semibold text-gray-700 text-2xl pt-6">
                      All Services
                    </h2>
                    <div className="p-6 flex gap-4 items-center h-full">
                      <div className="grid grid-cols-3 gap-4">
                        {allServices.map((service, index) => {
                          return (
                            <ListItem className="p-0" key={index}>
                              <label
                                htmlFor={service._id}
                                className="flex w-full cursor-pointer items-center px-3 py-2"
                              >
                                <ListItemPrefix className="mr-3">
                                  <Checkbox
                                    id={service._id}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        // If the checkbox is checked, add the service to UpdatedServices
                                        setUpdatedServices([
                                          ...UpdatedServices,
                                          service,
                                        ]);
                                      } else {
                                        // If the checkbox is unchecked, remove the service from UpdatedServices
                                        setUpdatedServices(
                                          UpdatedServices.filter(
                                            (updatedService) =>
                                              updatedService._id !== service._id
                                          )
                                        );
                                      }
                                    }}
                                    value={service.name}
                                    ripple={false}
                                    className="hover:before:opacity-0"
                                    containerProps={{
                                      className: "p-0",
                                    }}
                                  />
                                </ListItemPrefix>
                                <img
                                  src={service.icon.url}
                                  alt=""
                                  className="w-10 object-cover mr-2"
                                />
                                <Typography
                                  color="blue-gray"
                                  className="font-medium whitespace-nowrap"
                                >
                                  {service.name}
                                </Typography>
                              </label>
                            </ListItem>
                          );
                        })}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen2}
                        className="mr-1"
                      >
                        <span>Cancel</span>
                      </Button>
                      <Button
                        variant="gradient"
                        color="green"
                        loading={!profileUploaded}
                        onClick={handleUpdateServices}
                      >
                        <span>Update</span>
                      </Button>
                    </DialogFooter>
                  </Dialog>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  {UpdatedServices?.map((service, index) => {
                    return (
                      <ListItem
                        key={index}
                        ripple={false}
                        className="py-2 text-blue-gray-500 text-xl"
                      >
                        <img
                          src={service.icon.url}
                          alt=""
                          className="w-10 object-cover mr-2"
                        />
                        {service.name}
                        <ListItemSuffix>
                          <IconButton
                            variant="text"
                            color="red"
                            onClick={() => {
                              handleDeleteService(service._id);
                            }}
                          >
                            <MdDelete size={25} />
                          </IconButton>
                        </ListItemSuffix>
                      </ListItem>
                    );
                  })}
                </div>
                <ServiceProviderLocation />
                <div className="container mx-auto px-4 py-8 ">
                  <div className="flex items-center md:flex-row flex-col justify-between mb-4">
                    <h2 className="text-2xl font-bold mb-4">
                      Reviews by users
                    </h2>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Rating value={4} />
                      </div>
                      <span className="ml-2 text-gray-700">(4 reviews)</span>
                    </div>
                  </div>
                  <div className="overflow-auto h-96">
                    <div className="flex flex-wrap m-2 ">
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} {...review} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default ServiceProvider;
