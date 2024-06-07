"use client";
import { storage } from "@/firebase";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dialog,
  DialogFooter,
  Input,
  ListItem,
  ListItemSuffix,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import React, { useState } from "react";
import { IoMdOpen } from "react-icons/io";
import { MdDelete, MdEdit } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { TiArrowRepeat } from "react-icons/ti";

const SubServiceCard = ({ sub, index, serviceId }) => {
  const [subService, setSubService] = useState(sub);
  const [open2, setOpen2] = useState(false);
  const handleOpen2 = () => setOpen2(!open2);
  const [openEditDailog, setOpenEditDailog] = useState(false);
  const handleAlterEditDailog = () => setOpenEditDailog(!openEditDailog);

  const totalEarningFunction = () => {
    let total = 0;
    for (let i = 0; i < subService.bookings.length; i++) {
      total += subService.bookings[i].price;
    }
    return total;
  };
  const totalEarning = totalEarningFunction();

  const deleteSubService = async () => {
    try {
      const confirmation = confirm(
        "Are you sure you want to delete this sub service"
      );
      if (!confirmation) return;
      await deleteObject(ref(storage, subService.icon.name));
      const res = await fetch(
        `/api/services/${serviceId}/sub-service/${subService._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      }
      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleReplaceIcon = async (image) => {
    try {
      if (!image) return;
      await deleteObject(ref(storage, subService.icon.name));
      const iconRef = ref(
        storage,
        `subServiceIcons/${image.lastModified + image.size + image.name}`
      );
      await uploadBytes(iconRef, image);
      const iconUrl = await getDownloadURL(iconRef); // Get the image URL directly
      const iconObject = { url: iconUrl, name: iconRef._location.path_ };
      const postData = { ...subService, icon: iconObject };
      setSubService(postData);
      const res = await fetch(
        `/api/services/${serviceId}/sub-service/${subService._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: postData }),
        }
      );
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setOpen2(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleUpdateSubServiceDetails = async () => {
    try {
      const res = await fetch(
        `/api/services/${serviceId}/sub-service/${subService._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: subService }),
        }
      );
      const data = await res.json();
      setOpenEditDailog(false);
      if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Card className="w-full max-w-72 shadow-lg" key={index}>
      <CardHeader floated={false} color="blue-gray">
        <img
          src={subService.icon.url}
          alt="Service Iconr"
          className="object-cover"
        />
        {/* <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-tr from-transparent via-transparent to-black/60 " /> */}
      </CardHeader>
      <CardBody>
        <div className="mb-1 flex flex-col justify-start gap-2">
          <div>
            <span
              className={`border ${
                subService.status === "active" ? "bg-teal-100" : "bg-red-100"
              }  text-xs ${
                subService.status === "active"
                  ? "text-teal-700"
                  : "text-red-700"
              }  px-2 py-1 rounded-full`}
            >
              {subService.status}
            </span>
          </div>
          <Typography variant="h4" color="blue-gray" className="font-medium">
            {subService.name}
          </Typography>
        </div>
        <div className="flex flex-col">
          <div className="mb-1 flex gap-2">
            <Typography
              color="blue-gray"
              className="flex items-center gap-1.5 font-normal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="-mt-0.5 h-5 w-5 text-yellow-700"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
              5.0
            </Typography>
            <Typography color="gray">
              | {subService.reviews.length} Reviews
            </Typography>
          </div>
          <div className="text-2xl font-bold text-teal-500">
            ₹{subService.price}
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0 flex flex-col gap-2">
        <Button
          size="lg"
          fullWidth={true}
          onClick={handleOpen2}
          variant="gradient"
          color="indigo"
          className="flex gap-1 items-center justify-center"
        >
          View <IoMdOpen size={20} />
        </Button>
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
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-3xl font-bold text-indigo-500 font-lato text-center">
              Sub Service
            </h1>
            <button
              onClick={handleOpen2}
              title="Close"
              className="hover:scale-125 transition-all duration-500 ease-in-out"
            >
              <RxCross2 size={25} />
            </button>
          </div>

          <div className="flex gap-4 px-6">
            <img
              src={subService.icon?.url}
              alt=""
              className="w-32 h-full rounded-md object-cover drop-shadow-lg"
            />
            <div className="flex flex-col gap-2 justify-center">
              <div>
                <span
                  className={`border ${
                    subService.status === "active"
                      ? "bg-teal-100"
                      : "bg-red-100"
                  }  text-xs ${
                    subService.status === "active"
                      ? "text-teal-700"
                      : "text-red-700"
                  }  px-2 py-1 rounded-full`}
                >
                  {subService.status}
                </span>
              </div>
              <h1 className="font-bold text-5xl text-gray-700">
                {subService.name}
              </h1>
              <div className="flex">
                <label
                  htmlFor="icon"
                  className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded-md cursor-pointer"
                >
                  Replace Icon <TiArrowRepeat size={18} />
                  <input
                    type="file"
                    className="hidden"
                    id="icon"
                    onChange={(e) => handleReplaceIcon(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-6 w-full my-4 px-6">
            <div className="bg-white w-full p-4 grid grid-cols-1 gap-4 rounded-lg shadow-md">
              <ListItem className="text-teal-500">
                Price
                <ListItemSuffix>₹{subService.price}</ListItemSuffix>
              </ListItem>
              <ListItem>
                Bookings
                <ListItemSuffix>{subService.bookings.length}</ListItemSuffix>
              </ListItem>
              <ListItem>
                Total Earnings
                <ListItemSuffix>{totalEarning}</ListItemSuffix>
              </ListItem>
              <ListItem>
                Reviews
                <ListItemSuffix>
                  <div className="mb-1 flex gap-2">
                    <Typography
                      color="blue-gray"
                      className="flex items-center gap-1.5 font-normal"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="-mt-0.5 h-5 w-5 text-yellow-700"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                      5.0
                    </Typography>
                    <Typography color="gray">
                      | {subService.reviews.length} Reviews
                    </Typography>
                  </div>
                </ListItemSuffix>
              </ListItem>
              <ListItem>
                Service Create at
                <ListItemSuffix>{subService.createdAt}</ListItemSuffix>
              </ListItem>
            </div>
          </div>
          <DialogFooter>
            <Button variant="gradient" color="red" className="mr-1">
              <span
                className="flex items-center gap-1"
                onClick={deleteSubService}
              >
                Delete <MdDelete />
              </span>
            </Button>
            <Button
              variant="gradient"
              color="indigo"
              onClick={handleAlterEditDailog}
            >
              <span className="flex items-center gap-1">
                Edit <MdEdit />
              </span>
            </Button>
            <Dialog
              size="sm"
              className="bg-gray-200"
              open={openEditDailog}
              handler={handleAlterEditDailog}
              animate={{
                mount: { scale: 1, y: 0, x: 0 },
                unmount: { scale: 0, y: 200, x: 400 },
              }}
            >
              <div className="flex justify-between items-center px-6 py-4">
                <h1 className="text-3xl font-bold text-indigo-500 font-lato text-center">
                  Edit Sub Service
                </h1>
                <button
                  onClick={handleAlterEditDailog}
                  title="Close"
                  className="hover:scale-125 transition-all duration-500 ease-in-out"
                >
                  <RxCross2 size={25} />
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 gap-4 overflow-auto">
                <Input
                  className="bg-white"
                  color="indigo"
                  label="Name"
                  value={subService.name}
                  onChange={(e) =>
                    setSubService({ ...subService, name: e.target.value })
                  }
                />
                <Input
                  className="bg-white"
                  color="indigo"
                  label="Price"
                  value={subService.price}
                  onChange={(e) =>
                    setSubService({ ...subService, price: e.target.value })
                  }
                />
                <Select
                  className="bg-white"
                  label="Status"
                  value={subService.status}
                  onChange={(e) => setSubService({ ...subService, status: e })}
                >
                  <Option className="text-teal-500" value="active">
                    Active
                  </Option>
                  <Option className="text-red-500" value="inActive">
                    InActive
                  </Option>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  variant="text"
                  color="red"
                  onClick={handleAlterEditDailog}
                  className="mr-1"
                >
                  <span>Cancel</span>
                </Button>
                <Button
                  variant="gradient"
                  color="teal"
                  onClick={handleUpdateSubServiceDetails}
                >
                  <span>Update</span>
                </Button>
              </DialogFooter>
            </Dialog>
          </DialogFooter>
        </Dialog>
        <Button
          onClick={deleteSubService}
          size="lg"
          fullWidth={true}
          variant="gradient"
          color="red"
          className="flex gap-1 items-center justify-center"
        >
          Delete <MdDelete size={20} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubServiceCard;
