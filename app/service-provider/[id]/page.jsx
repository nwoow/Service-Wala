"use client";
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Nav from "@/components/Nav";
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
import { MdDelete, MdMedicalServices } from "react-icons/md";
import Footer from "@/components/Footer";
import ServiceProviderLocation from "@/components/ServiceProviderLocation";
import { HiPencilSquare } from "react-icons/hi2";
import axios from "axios";

const reviews = [
  {
    id: 1,
    name: "Musharraf Jamal",
    review: "Service provider were soo delicate to his work.",
    rating: 4,
    img: "/image/hero1.webp",
  },
  {
    id: 2,
    name: "Angila",
    review: "Good in work but behavior is not friendly at all.",
    rating: 3,
    img: "/image/hero1.webp",
  },
  // ... other reviews
];

const ReviewCard = ({ name, review, rating, img }) => (
  <div className="w-full md:w-1/2 p-2">
    <div className="bg-white p-4 h-52 shadow rounded-lg flex items-start space-x-4">
      <div className="relative w-12 h-12">
        <Image
          src={img}
          alt={name}
          layout="fill"
          sizes="20"
          objectFit="cover"
          className="rounded-full"
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold">{name}</h3>
            <div className="flex items-center">
              <Rating value={rating} />
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
  const [user, setUser] = useState({});
  const [allServices, setAllServices] = useState([]);
  const [updatedServices, setUpdatedServices] = useState([]);
  const [updateUser, setUpdateUser] = useState({});
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [profileUploaded, setProfileUploaded] = useState(true);
  const [fetchedServicesFromId, setFetchedServicesFromId] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const gettingUser = useCallback(async () => {
    const response = await fetch(`/api/service-providers/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    setUser(data);
  }, [id]);

  const formatDate = useCallback((dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  }, []);

  const formattedDate = useMemo(
    () => formatDate(updateUser.createdAt),
    [updateUser.createdAt, formatDate]
  );

  const handleOpen = () => setOpen(!open);
  const handleOpen2 = () => setOpen2(!open2);

  const handleUploadProfile = useCallback(
    async (profileImage) => {
      if (!profileImage) {
        alert("Invalid Image");
        return;
      }
      setProfileUploaded(false);
      try {
        const imageRef = ref(
          storage,
          `service-provider/${Date.now()}_${profileImage.name}`
        );
        if (updateUser.image.url) {
          await deleteObject(ref(storage, updateUser.image.name));
        }
        await uploadBytes(imageRef, profileImage);
        const imageUrl = await getDownloadURL(imageRef);
        const imageObject = { url: imageUrl, name: imageRef._location.path_ };
        await fetch(`/api/service-providers/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...updateUser, image: imageObject }),
        });
        setUpdateUser((prev) => ({ ...prev, image: imageObject }));
        setProfileUploaded(true);
      } catch (err) {
        console.error(err);
        setProfileUploaded(true);
      }
    },
    [id, updateUser]
  );

  const handleUpdate = useCallback(async () => {
    const response = await fetch(`/api/service-providers/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateUser),
    });
    if (response.ok) {
      setOpen(false);
      gettingUser();
    }
  }, [id, updateUser, gettingUser]);

  useEffect(() => {
    if (user._id) {
      setUpdateUser(user);
      setUpdatedServices(user.services || []);
    }
  }, [user]);

  const getAllService = useCallback(async () => {
    const response = await fetch("/api/services", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    setAllServices(data);
  }, []);

  const filteredServices = useMemo(() => {
    if (user.services) {
      return allServices.filter((e) => !user.services.includes(e._id));
    }
  }, [allServices, user.services]);

  const handleUpdateServices = useCallback(async () => {
    const response = await fetch(`/api/service-providers/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updateUser, services: updatedServices }),
    });
    if (response.ok) {
      setOpen2(false);
      gettingUser(); // This will update the user state with the new services
      getAllService(); // This will get all services again, including the ones that were just added
    }
  }, [id, updateUser, updatedServices, gettingUser, getAllService]);

  const handleDeleteService = useCallback(
    async (serviceId) => {
      try {
        // Filter out the service to be deleted
        const deletedServicesFiltered = updatedServices.filter(
          (e) => e !== serviceId
        );

        // Send request to update the service provider's services
        const response = await fetch(`/api/service-providers/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...updateUser,
            services: deletedServicesFiltered,
          }),
        });

        // Check if the response is successful
        if (response.ok) {
          // Update local state to reflect changes
          setUpdatedServices(deletedServicesFiltered);
          setFetchedServicesFromId((prev) =>
            prev.filter((s) => s._id !== serviceId)
          );
          setOpen2(false);
          gettingUser(); // Re-fetch user data to ensure state is in sync
        } else {
          console.error("Failed to delete service");
        }
      } catch (err) {
        console.error("Error deleting service:", err);
      }
    },
    [id, updateUser, updatedServices, gettingUser]
  );

  const fetchingServices = useCallback(async () => {
    if (updatedServices.length > 0) {
      try {
        const res = await axios.post(
          `/api/service-providers/services-from-array-of-id`,
          updatedServices
        );
        setFetchedServicesFromId(res.data);
      } catch (err) {
        console.log(err);
      }
    }
  }, [updatedServices]);

  useEffect(() => {
    fetchingServices();
  }, [fetchingServices]);

  const chechingAuthorization = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    const response = await fetch(`/api/users/${token}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (data.role !== "service-provider") {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      await chechingAuthorization();
      getAllService();
      gettingUser();
      if (isMounted) setLoading(false);
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);


  if (loading) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="loaction-loader"></div>
          <div className="text-2xl font-julius">Loading</div>
        </div>
      </div>
    );
  }

  return (
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
                    src={updateUser?.image?.url || user?.image?.url}
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
              <Button
                onClick={handleOpen}
                variant="gradient"
                color="blue"
                className="mt-3 md:mt-0 flex justify-center items-center whitespace-nowrap gap-1 rounded text-sm"
              >
                Edit Profile <HiPencilSquare size={18} />
              </Button>
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
                        {user?.name && Array.from(user?.name)[0].toUpperCase()}
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
                    onClick={handleUpdate}
                  >
                    <span>Update</span>
                  </Button>
                </DialogFooter>
              </Dialog>
            </div>
            <div className="flex flex-col shadow-lg gap-6 w-full h-full bg-white rounded-md px-6 py-4">
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
                <div>Account Created on</div>
                <div>{formattedDate}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-lg flex flex-col gap-4 items-center my-6">
            <div className="flex items-center md:flex-row flex-col justify-between w-full">
              <h1 className="flex items-center gap-1 text-2xl md:flex-row font-bold text-gray-700">
                <IoSettings size={30} /> Services You Provide
              </h1>
              <Button
                onClick={handleOpen2}
                variant="gradient"
                color="blue"
                size="sm"
                className="mt-3 md:mt-0 flex justify-center items-center whitespace-nowrap gap-1 rounded text-sm px-5 py-3"
              >
                Add New Service <MdMedicalServices size={18} />
              </Button>
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
                    {filteredServices?.map((service, index) => {
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
                                    setUpdatedServices((prev) => [
                                      ...prev,
                                      service._id,
                                    ]);
                                  } else {
                                    setUpdatedServices((prev) =>
                                      prev.filter((id) => id !== service._id)
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              {fetchedServicesFromId?.map((service, index) => (
                <ListItem
                  key={index}
                  ripple={false}
                  className="py-2 text-gray-700 text-xl"
                >
                  <img
                    src={service?.icon?.url}
                    alt=""
                    className="w-10 object-cover mr-2"
                  />
                  {service?.name}
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
              ))}
            </div>
          </div>
          <ServiceProviderLocation serviceProvider={user} />
          {/* <div className="container mx-auto px-4 py-8 ">
            <div className="flex items-center md:flex-row flex-col justify-between mb-4">
              <h2 className="text-2xl font-bold mb-4">Reviews by users</h2>
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
          </div> */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceProvider;
