"use client";
import Nav from "@/components/Nav";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import {
  ListItem,
  ListItemSuffix,
  Button,
  Input,
  Dialog,
  Select,
  Option,
  DialogFooter,
  Carousel,
  IconButton,
  ButtonGroup,
} from "@material-tailwind/react";
import {
  IoIosAddCircleOutline,
  IoMdAddCircle,
  IoMdImages,
} from "react-icons/io";
import { TiArrowRepeat } from "react-icons/ti";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/firebase";
import SubServiceCard from "@/components/SubServiceCard";

const ServicePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [service, setService] = useState({
    bookings: [],
  });
  const [updateService, setUpdateService] = useState({
    bookings: [],
  });

  const getService = async () => {
    try {
      const res = await fetch(`/api/services/${id}`);
      const data = await res.json();
      console.log(data);
      setService(data);
      setUpdateService(data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getService();
  }, []);
  const totalEarningFunction = () => {
    let total = 0;
    for (let i = 0; i < service.bookings.length; i++) {
      total += service.bookings[i].price;
    }
    return total;
  };
  const totalEarning = totalEarningFunction();
  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
  }
  const formattedDate = formatDate(service.createdAt);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const [open2, setOpen2] = useState(false);
  const handleOpen2 = () => setOpen2(!open2);
  const [open3, setOpen3] = useState(false);
  const handleOpen3 = () => setOpen3(!open3);

  const [serviceData, setServiceData] = useState({
    name: "",
    status: "",
    price: "",
    icon: {
      url: "",
      name: "",
    },
  });
  const [images, setImages] = useState(null);
  const [imageUploaded, setimageUploaded] = useState(false);
  const handleCreateSubService = async () => {
    try {
      if (!images) {
        alert("Invalid icon / Gallery Image");
        return;
      }
      setimageUploaded(true);
      const iconRef = ref(
        storage,
        `subServiceIcons/${images.lastModified + images.size + images.name}`
      );
      await uploadBytes(iconRef, images);
      const iconUrl = await getDownloadURL(iconRef); // Get the image URL directly
      const iconObject = { url: iconUrl, name: iconRef._location.path_ };
      const postData = {
        ...serviceData,
        icon: iconObject,
      };
      setServiceData(postData);

      console.log(postData);
      const response = await fetch(
        `/api/services/${id}/sub-service/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        },
        { cache: "no-store" }
      );
      const data = await response.json();
      console.log(data);
      setimageUploaded(false);
      setServiceData({
        name: "",
        status: "",
        price: "",
        icon: {
          url: "",
          name: "",
        },
      });
      gettingSubServices();
      setImages(null);
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
  const [subServices, setSubServices] = useState([]);
  const gettingSubServices = async () => {
    try {
      const res = await fetch(`/api/services/${id}`);
      const data = await res.json();
      console.log(data);
      setSubServices(data.subServices);
    } catch (err) {
      console.log(err);
    }
  };
  const handleDeleteService = async () => {
    try {
      const confirmation = confirm(
        "Are you sure you want to delete this service"
      );
      if (!confirmation) return;
      updateService.images.map((image) => {
        return deleteObject(ref(storage, image.name));
      });
      await deleteObject(ref(storage, updateService.icon.name));
      const response = await fetch(`/api/services/${id}/delete`, {
        method: "DELETE",
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        router.back();
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleUpdateServiceDetails = async () => {
    try {
      const response = await fetch(`/api/services/${id}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateService),
      });
      const data = await response.json();
      console.log(data);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };
  const handleUploadIcon = async (img) => {
    if (!img) {
      alert("Invalid icon");
      return;
    }
    await deleteObject(ref(storage, updateService.icon.name));
    const iconRef = ref(
      storage,
      `serviceIcons/${img.lastModified + img.size + img.name}`
    );
    await uploadBytes(iconRef, img);
    const iconUrl = await getDownloadURL(iconRef);
    const iconObject = { url: iconUrl, name: iconRef._location.path_ };
    setUpdateService({ ...updateService, icon: iconObject });
    setService({ ...service, icon: iconObject });
    const postData = {
      ...updateService,
      icon: iconObject,
    };
    const response = await fetch(`/api/services/${id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    await response.json();
  };

  const handleUploadImages = async (imgs) => {
    if (!imgs) {
      alert("Invalid icon / Gallery Image");
      return;
    }
    const images = Object.values(imgs);
    const imagesUrlArray = await Promise.all(
      images.map(async (img) => {
        const imageRef = ref(
          storage,
          `serviceImages/${img.lastModified + img.size + img.name}`
        );
        await uploadBytes(imageRef, img);
        const imageUrl = await getDownloadURL(imageRef); // Get the image URL directly
        const imageObject = { url: imageUrl, name: imageRef._location.path_ };
        return imageObject;
      })
    );
    const postData = {
      ...updateService,
      images: [...updateService.images, ...imagesUrlArray],
    };
    setUpdateService(postData);
    setService(postData);

    await fetch(`/api/services/${id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
  };

  const handleDeleteServiceImage = async (image) => {
    await deleteObject(ref(storage, image.name));
    setUpdateService({
      ...updateService,
      images: updateService.images.filter((e, i) => e.name !== image.name),
    });
    setService({
      ...service,
      images: service.images.filter((e, i) => e.name !== image.name),
    });
    const postData = {
      ...updateService,
      images: updateService.images.filter((e, i) => e.name !== image.name),
    };
    await fetch(`/api/services/${id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
  };
  const handleReplaceServiceImage = async (NewImage, oldImage) => {
    await deleteObject(ref(storage, oldImage.name));
    let postData = {
      ...updateService,
      images: updateService.images.filter((e, i) => e.name !== oldImage.name),
    };
    const imageRef = ref(
      storage,
      `serviceImages/${NewImage.lastModified + NewImage.size + NewImage.name}`
    );
    await uploadBytes(imageRef, NewImage);
    const imageUrl = await getDownloadURL(imageRef); // Get the image URL directly
    const imageObject = { url: imageUrl, name: imageRef._location.path_ };
    postData = {
      ...postData,
      images: [...postData.images, imageObject],
    };
    setUpdateService(postData);
    setService(postData);
    await fetch(`/api/services/${id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
  };
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
    if (data.role !== "admin") {
      window.location.href = "/";
    }
  };
  const [loading, setLoading] = useState(true);
  const loadingFunction = async () => {
    await chechingAuthorization();
    await gettingSubServices();
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
          <div className="px-4 md:px-20 my-6 flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row justify-between">
              <button
                onClick={router.back}
                className="text-xl flex gap-1 items-center cursor-pointer text-gray-700"
                title="Go Back"
              >
                <FaArrowLeft />
                Service Details
              </button>
              <div className="flex gap-2">
                <ButtonGroup ripple={true} color="brown" variant="text" size="sm">
                  <Button className="flex items-center gap-1" onClick={handleOpen2} >
                    Edit details <MdEdit size={20} />
                  </Button>
                  <Button className="flex items-center gap-1"  onClick={handleOpen3}>
                    Change images <IoMdImages size={20} />
                  </Button>
                  <Button className="flex items-center gap-1 text-deep-orange-500" onClick={handleDeleteService}>
                    Delete This Service <MdDelete size={20} />
                  </Button>
                </ButtonGroup>
                {/* <button
                  onClick={handleOpen2}
                  className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm py-2 px-4 rounded-lg bg-gradient-to-tr from-gray-700 to-gray-800 text-white shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] flex items-center gap-1"
                >
                  Edit details
                  <MdEdit />
                </button>
                <button
                  onClick={handleOpen3}
                  className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm py-2 px-4 rounded-lg bg-gradient-to-tr from-gray-700 to-gray-800 text-white shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] flex items-center gap-1"
                >
                  Change images
                  <IoMdImages />
                </button>
                <button
                  onClick={handleDeleteService}
                  className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm py-2 px-4 rounded-lg bg-gradient-to-tr from-red-400 to-red-500 text-white shadow-md shadow-red-100 hover:shadow-lg hover:shadow-red-100 active:opacity-[0.85] flex items-center gap-1"
                >
                  Delete
                  <MdDelete />
                </button> */}
                <Dialog
                  size="lg"
                  className="bg-gray-200"
                  open={open2}
                  handler={handleOpen2}
                  animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                  }}
                >
                  <h1 className="text-3xl font-bold text-indigo-500 font-lato p-4 text-center">
                    Create New Service
                  </h1>
                  <div className="p-4 grid grid-cols-2 gap-4 overflow-auto">
                    <Input
                      className="bg-white"
                      color="indigo"
                      label="Name"
                      value={updateService.name}
                      onChange={(e) =>
                        setUpdateService({
                          ...updateService,
                          name: e.target.value,
                        })
                      }
                    />
                    <Select
                      className="bg-white"
                      label="Status"
                      value={updateService.status}
                      onChange={(e) =>
                        setUpdateService({ ...updateService, status: e })
                      }
                    >
                      <Option className="text-teal-500" value="active">
                        Active
                      </Option>
                      <Option className="text-red-500" value="inActive">
                        InActive
                      </Option>
                    </Select>
                    <Select
                      className="bg-white"
                      label="Rank"
                      value={updateService.rank}
                      onChange={(e) =>
                        setUpdateService({ ...updateService, rank: e })
                      }
                    >
                      <Option value="1">1</Option>
                      <Option value="2">2</Option>
                      <Option value="3">3</Option>
                      <Option value="4">4</Option>
                      <Option value="5">5</Option>
                      <Option value="6">6</Option>
                      <Option value="7">7</Option>
                      <Option value="8">8</Option>
                      <Option value="9">9</Option>
                      <Option value="10">10</Option>
                    </Select>
                    <Input
                      color="indigo"
                      className="bg-white"
                      label="Tags - seperate with coma(,)"
                      value={updateService.tags}
                      onChange={(e) =>
                        setUpdateService({
                          ...updateService,
                          tags: e.target.value,
                        })
                      }
                    />
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
                      color="teal"
                      loading={imageUploaded}
                      onClick={handleUpdateServiceDetails}
                    >
                      <span>Update</span>
                    </Button>
                  </DialogFooter>
                </Dialog>

                <Dialog
                  size="lg"
                  className="bg-gray-200"
                  open={open3}
                  handler={handleOpen3}
                  animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                  }}
                >
                  <h1 className="text-3xl font-bold text-indigo-500 font-lato p-4 text-center">
                    Create New Service
                  </h1>
                  <div className="p-4 grid grid-cols-1 gap-4 overflow-auto">
                    <div>
                      <h2 className="text-center font-semibold text-gray-700 text-lg pb-2">
                        Service Icon
                      </h2>
                      <div className="flex justify-between items-center p-4 shadow-lg h-fit bg-white text-white rounded-md">
                        <img
                          src={updateService.icon?.url}
                          alt=""
                          className="w-24 h-24 object-cover rounded drop-shadow-lg"
                        />
                        <div className="flex flex-col justify-between py-1 gap-1">
                          <label
                            htmlFor={"icon"}
                            className="px-2 py-1 rounded bg-indigo-300 cursor-pointer flex gap-1 items-center justify-center"
                          >
                            Replace <TiArrowRepeat />
                          </label>
                          <input
                            type="file"
                            id={"icon"}
                            onChange={(e) =>
                              handleUploadIcon(e.target.files[0])
                            }
                            className="hidden"
                          ></input>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center px-2">
                        <h2 className="text-center font-semibold text-gray-700 text-lg pb-2">
                          Gallery Images
                        </h2>
                        <label
                          htmlFor="new-gallery-img"
                          className="flex gap-1 cursor-pointer"
                        >
                          Add new <IoIosAddCircleOutline size={24} />
                        </label>
                        <input
                          onChange={(e) => handleUploadImages(e.target.files)}
                          type="file"
                          className="hidden"
                          id="new-gallery-img"
                          multiple
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 max-h-72 overflow-auto">
                        {updateService.images &&
                          updateService.images.map((image, index) => {
                            return (
                              <div
                                className="flex justify-between items-center p-4 shadow-lg h-fit bg-white text-white rounded-md"
                                key={index}
                              >
                                <img
                                  src={image.url}
                                  alt=""
                                  className="w-24 h-24 object-cover rounded shadow-md"
                                />
                                <div className="flex flex-col justify-between py-1 gap-1">
                                  <label
                                    htmlFor={index}
                                    className="px-2 py-1 rounded bg-indigo-300 cursor-pointer flex gap-1 items-center justify-center"
                                  >
                                    Replace <TiArrowRepeat />
                                  </label>
                                  <input
                                    type="file"
                                    id={index}
                                    className="hidden"
                                    onChange={(e) =>
                                      handleReplaceServiceImage(
                                        e.target.files[0],
                                        image
                                      )
                                    }
                                  ></input>
                                  <button
                                    className="px-2 py-1 rounded bg-red-300 cursor-pointer flex gap-1 items-center justify-center"
                                    onClick={() =>
                                      handleDeleteServiceImage(image)
                                    }
                                  >
                                    Delete <MdDelete />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </Dialog>
              </div>
            </div>

            <div className="flex gap-4">
              <img
                src={service.icon?.url}
                alt=""
                className="w-32 h-full rounded-md object-cover drop-shadow-lg"
              />
              <div className="flex flex-col gap-2 justify-center">
                <div>
                  <span
                    className={`border ${
                      service.status === "active" ? "bg-teal-100" : "bg-red-100"
                    }  text-xs ${
                      service.status === "active"
                        ? "text-teal-700"
                        : "text-red-700"
                    }  px-2 py-1 rounded-full`}
                  >
                    {service.status}
                  </span>
                </div>
                <h1 className="font-bold text-5xl text-gray-700">
                  {service.name}
                </h1>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 w-full ">
              <div className="bg-white w-full p-4 grid grid-cols-1 gap-4 rounded-lg shadow-md">
                <ListItem>
                  Rank
                  <ListItemSuffix>{service.rank}/10</ListItemSuffix>
                </ListItem>
                <ListItem>
                  Bookings
                  <ListItemSuffix>{service.bookings.length}</ListItemSuffix>
                </ListItem>
                <ListItem>
                  Total Earnings
                  <ListItemSuffix>{totalEarning}</ListItemSuffix>
                </ListItem>
                <ListItem>
                  Service Create at
                  <ListItemSuffix>{formattedDate}</ListItemSuffix>
                </ListItem>
              </div>
              <Carousel
                className="rounded-md w-full max-h-72 overflow-hidden"
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
                {updateService.images?.map((image) => {
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
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-indigo-500 font-lato text-center">
                Sub Services
              </h1>
              <Button
                size="md"
                variant="gradient"
                color="indigo"
                className="flex gap-2 items-center"
                onClick={handleOpen}
              >
                Create Sub Service <IoMdAddCircle size={20} />
              </Button>
              <Dialog
                size="lg"
                open={open}
                handler={handleOpen}
                animate={{
                  mount: { scale: 1, y: 0 },
                  unmount: { scale: 0.9, y: -100 },
                }}
              >
                <h1 className="text-3xl font-bold text-indigo-500 font-lato p-4 text-center">
                  Create New Sub Service
                </h1>
                <div className="p-4 grid grid-cols-2 gap-6 overflow-auto">
                  <Input
                    color="indigo"
                    label="Name"
                    onChange={(e) =>
                      setServiceData({ ...serviceData, name: e.target.value })
                    }
                  />
                  <Input
                    color="teal"
                    label="Price"
                    onChange={(e) =>
                      setServiceData({ ...serviceData, price: e.target.value })
                    }
                  />
                  <Select
                    label="Status"
                    color="indigo"
                    size="md"
                    onChange={(e) =>
                      setServiceData({ ...serviceData, status: e })
                    }
                  >
                    <Option className="text-teal-500" value="active">
                      Active
                    </Option>
                    <Option className="text-red-500" value="inactive">
                      InActive
                    </Option>
                  </Select>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <label htmlFor="icon">Icon</label>
                    <input
                      className="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-xs font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                      type="file"
                      onChange={(e) => setImages(e.target.files[0])}
                      id="icon"
                    />
                  </div>
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
                    onClick={handleCreateSubService}
                    variant="gradient"
                    color="teal"
                    loading={imageUploaded}
                  >
                    <span>Create</span>
                  </Button>
                </DialogFooter>
              </Dialog>
            </div>
            <div className="h-px bg-gray-400 w-full"></div>

            <div className="flex justify-start gap-6">
              {subServices.map((sub, index) => {
                return (
                  <SubServiceCard key={index} sub={sub} index={index} serviceId={id} />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServicePage;
