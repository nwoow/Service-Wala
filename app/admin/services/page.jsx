"use client";
import Nav from "@/components/Nav";
import React, { useEffect, useState } from "react";
import { IoMdInformationCircle } from "react-icons/io";
import { MdLibraryAdd } from "react-icons/md";
import {
  Button,
  Dialog,
  DialogFooter,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";
import Link from "next/link";

const Services = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(!open);

  const [serviceData, setServiceData] = useState({
    name: "",
    status: "",
    rank: "",
    tags: "",
    icon: {
      url: "",
      name: "",
    },
    images: [],
  });
  const [images, setImages] = useState({
    icon: null,
    images: null,
  });
  const [imageUploaded, setimageUploaded] = useState(false);
  const handleCreateService = async () => {
    try {
      if (!images.icon && images.images.length === 0) {
        alert("Invalid icon / Gallery Image");
        return;
      }
      setimageUploaded(true);
      const iconRef = ref(
        storage,
        `serviceIcons/${
          images.icon.lastModified + images.icon.size + images.icon.name
        }`
      );
      await uploadBytes(iconRef, images.icon);
      const iconUrl = await getDownloadURL(iconRef); // Get the image URL directly
      const iconObject = { url: iconUrl, name: iconRef._location.path_ };
      const arrayOfImages = Object.values(images.images);
      const imagesUrlArray = await Promise.all(
        arrayOfImages.map(async (img) => {
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
      setServiceData({
        ...serviceData,
        icon: iconObject,
        images: imagesUrlArray,
      });
      const postData = {
        ...serviceData,
        icon: iconObject,
        images: imagesUrlArray,
      };
      const response = await fetch(
        "/api/services/create",
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
      setimageUploaded(false);
      setServiceData({
        name: "",
        status: "",
        rank: "",
        tags: "",
        icon: {
          url: "",
          name: "",
        },
        images: [],
      });
      setImages({
        icon: null,
        images: null,
      });
      setOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };
  const [allServices, setAllServices] = useState([]);
  const gettingServices = async () => {
    try {
      const fetchedData = await fetch("/api/services", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await fetchedData.json();
      console.log(response);
      setAllServices(response);
    } catch (err) {
      console.error(err);
    }
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
    await gettingServices();
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
          <div className="px-10 md:px-20 flex flex-col gap-2 sm:flex-row justify-between items-center pt-6">
            <h1 className="font-bold text-3xl text-gray-700">All Services</h1>
            <button
              onClick={handleOpen}
              className="align-middle sm:w-fit w-full select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none py-2 px-4 rounded-lg bg-gradient-to-tr from-indigo-400 to-indigo-500 text-white shadow-md shadow-gray-900/10 hover:shadow-md hover:shadow-indigo-200 active:opacity-[0.85] flex items-center justify-center gap-1"
            >
              Create New Service
              <MdLibraryAdd />
            </button>
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
                Create New Service
              </h1>
              <div className="p-4 grid grid-cols-2 gap-4 overflow-auto">
                <Input
                  color="indigo"
                  label="Name"
                  onChange={(e) =>
                    setServiceData({ ...serviceData, name: e.target.value })
                  }
                />
                <Select
                  label="Status"
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
                <Select
                  label="Rank"
                  onChange={(e) => setServiceData({ ...serviceData, rank: e })}
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
                  label="Tags - seperate with coma(,)"
                  onChange={(e) =>
                    setServiceData({ ...serviceData, tags: e.target.value })
                  }
                />
                <div className="flex flex-col gap-2 cursor-pointer">
                  <label htmlFor="icon">Icon</label>
                  <input
                    className="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-xs font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                    type="file"
                    onChange={(e) =>
                      setImages({ ...images, icon: e.target.files[0] })
                    }
                    id="icon"
                  />
                </div>
                <div className="flex flex-col gap-2 cursor-pointer">
                  <label htmlFor="gallery-images">Gallery Images</label>
                  <input
                    className="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-xs font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                    type="file"
                    multiple
                    id="gallery-images"
                    onChange={(e) =>
                      setImages({ ...images, images: e.target.files })
                    }
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
                  variant="gradient"
                  color="teal"
                  loading={imageUploaded}
                  onClick={handleCreateService}
                >
                  <span>Create</span>
                </Button>
              </DialogFooter>
            </Dialog>
          </div>
          <div className="px-10 md:px-20 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allServices.map((serv,index) => {
              return (
                <div key={index} className="p-4 shadow border bg-white border-gray-300 rounded-lg flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2 items-center">
                      <img
                        src={serv.icon.url}
                        alt="ac"
                        className="w-24 h-24 drop-shadow-lg object-cover rounded"
                      />
                      <div className="flex flex-col gap-2 justify-center">
                        <div>
                          <span
                            className={`border ${
                              serv.status === "active"
                                ? "bg-teal-100"
                                : "bg-red-100"
                            }  text-xs ${
                              serv.status === "active"
                                ? "text-teal-700"
                                : "text-red-700"
                            }  px-2 py-1 rounded-full`}
                          >
                            {serv.status}
                          </span>
                        </div>
                        <h1 className="font-bold text-2xl text-gray-700">
                          {serv.name}
                        </h1>
                      </div>
                    </div>
                    <div className="flex w-full gap-2 items-center">
                      <div className="bg-gray-500 w-full h-[1px]"></div>
                      <div className="whitespace-nowrap text-gray-700 text-xs">
                        Sub Services
                      </div>
                    </div>
                  </div>
                  <div className="max-h-56 overflow-auto no-scrollbar">
                    {serv.subServices.length === 0 ? (
                      <div className="text-center text-xl">
                        🚫Uh oh, There are no Sub services yet.
                      </div>
                    ) : (
                      serv.subServices.map((sub,index) => {
                        return (
                          <div key={index} className="flex gap-2 items-center hover:bg-gray-300 rounded cursor-pointer transition-all duration-500 p-2">
                            <img
                              src={sub.icon?.url}
                              alt=""
                              className="w-14 h-14 object-cover rounded shadow-md"
                            />
                            <h4 className="whitespace-nowrap">{sub.name}</h4>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="w-full flex justify-end">
                    <Link
                      href={`/admin/services/${serv._id}`}
                      className="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-2 px-4 rounded-lg bg-gradient-to-tr from-gray-900 to-gray-800 text-white shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] flex items-center gap-3"
                    >
                      <IoMdInformationCircle size={25} />
                      More details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Services;
