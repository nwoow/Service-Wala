"use client";
import Nav from "@/components/Nav";
import { FaUsersGear } from "react-icons/fa6";
import { MdOpenInNew } from "react-icons/md";
import {
  Button,
  Input,
  Dialog,
  DialogFooter,
  ListItem,
  ListItemSuffix,
  Select,
  Option,
} from "@material-tailwind/react";
import { IoIosSearch } from "react-icons/io";
import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaUserAltSlash } from "react-icons/fa";
import { AiOutlineUserDelete } from "react-icons/ai";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/firebase";
import Fuse from "fuse.js";

const ServiceProviders = () => {
  const [openDialogId, setOpenDialogId] = useState(null);

  const handleOpen = (userId) => {
    setOpenDialogId(userId);
  };

  const handleClose = () => {
    setOpenDialogId(null);
  };

  const [allUsers, setAllUsers] = useState([]);

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
  }
  const gettingUsers = async () => {
    try {
      const response = await fetch("/api/admin/service-providers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      const data = await response.json();
      console.log(data);
      setAllUsers(data);
    } catch (error) {
      console.log(error);
    }
  };
  const userDeactivating = async (user) => {
    try {
      const updatedUser = { ...user, active: user.active ? false : true };
      console.log(updatedUser);
      const response = await fetch(`/api/admin/service-providers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
        cache: "no-store",
      });
      if (response.ok) {
        // setOpen(false);
        gettingUsers();
      }
    } catch (err) {
      console.log(err);
    }
  };
  const userDeleting = async (user) => {
    if (user.image.url !== undefined) {
      await deleteObject(ref(storage, user.image.name));
    }
    const confirmation = confirm(`Are you sure you want to delete this user`);
    if (!confirmation) return;
    console.log(user);
    try {
      const response = await fetch(`/api/admin/service-providers`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
        cache: "no-store",
      });
      if (response.ok) {
        // setOpen(false);
        gettingUsers();
      }
    } catch (err) {
      console.log(err);
    }
  };
  const [filterByStatus, setfilterByStatus] = useState("both");
  const handleFilterByStatus = async (val) => {
    const response = await fetch("/api/admin/service-providers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const data = await response.json();
    setfilterByStatus(val);
    const checkStatement =
      val === "active" ? true : val === "inactive" ? false : "both";
    if (checkStatement == "both") {
      setAllUsers(data);
      return;
    }
    const serviceProviders = data.filter((e, i) => {
      return e.active === checkStatement;
    });
    setAllUsers(serviceProviders);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    const response = await fetch("/api/admin/service-providers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const data = await response.json();
    if (!query) {
      setAllUsers(data);
      return;
    }
    const fuse = new Fuse(data, {
      keys: ["name"],
      includeScore: true,
      threshold: 0.4, // Adjust this threshold as needed
      findAllMatches: true,
    });
    const result = fuse.search(query);
    const filteredUsers = result.map((item) => item.item);
    setAllUsers(filteredUsers);
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
    await gettingUsers();
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
          <div className="flex flex-col gap-4 md:flex-row w-full py-4 justify-between px-10 items-center">
            <div className="flex gap-2 items-center text-gray-700">
              <FaUsersGear size={30} />
              <span className="text-3xl font-bold">Service Providers</span>
            </div>
            <div className="flex md:w-fit w-full md:flex-row flex-col gap-3 items-center">
              <div className="md:w-72 w-full">
                <Input
                  label="Search Service Provider"
                  className="bg-white"
                  icon={<IoIosSearch />}
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              <div className="md:w-60 w-full bg-white">
                <Select
                  label="FIlter By Status"
                  value={filterByStatus}
                  onChange={(e) => handleFilterByStatus(e)}
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">InActive</Option>
                  <Option value="both">Both</Option>
                </Select>
              </div>
            </div>
          </div>
          <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-10 mt-8">
            {allUsers.map((user) => (
              <div
                className="border p-4 bg-white shadow flex flex-col gap-4 rounded-lg"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  {user?.image?.url ? (
                    <img
                      src={user.image.url}
                      alt={user.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 text-2xl rounded-full flex justify-center text-black font-junge items-center bg-gray-400 cursor-pointer">
                      {user.name && Array.from(user.name)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div>
                      <span
                        className={`border ${
                          user.active ? "bg-teal-100" : "bg-red-100"
                        }  text-xs ${
                          user.active ? "text-teal-700" : "text-red-700"
                        }  px-2 py-1 rounded-full`}
                      >
                        {user.active ? "active" : "Inactive"}
                      </span>
                    </div>
                    <div className="font-bold text-indigo-500 text-xl">
                      {user.name}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="gradient"
                      color="indigo"
                      onClick={() => handleOpen(user._id)}
                      className="flex items-center gap-1 w-full justify-center rounded"
                    >
                      View <MdOpenInNew />
                    </Button>
                  </div>

                  {openDialogId === user._id && (
                    <Dialog
                      size="lg"
                      open={true}
                      handler={handleClose}
                      className="bg-gray-200 px-4 md:px-10"
                    >
                      <div>
                        <div className="flex justify-between items-center py-6">
                          <h1 className="text-2xl font-bold text-indigo-500 font-lato text-center">
                            User Details
                          </h1>
                          <button
                            onClick={handleClose}
                            title="Close"
                            className="hover:scale-125 transition-all duration-500 ease-in-out "
                          >
                            <RxCross2 size={25} />
                          </button>
                        </div>
                        <div>
                          {/* Dialog content */}
                          <div className="flex gap-4">
                            {user?.image?.url ? (
                              <img
                                src={user.image.url}
                                alt={user.name}
                                className="w-32 h-full rounded-md object-cover drop-shadow-lg"
                              />
                            ) : (
                              <div className="w-32 h-32 text-6xl text-black rounded-full flex justify-center items-center font-junge bg-gray-400 cursor-pointer">
                                {user.name &&
                                  Array.from(user.name)[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col gap-2 justify-center">
                              <div>
                                <span
                                  className={`border ${
                                    user.active ? "bg-teal-100" : "bg-red-100"
                                  }  text-xs ${
                                    user.active
                                      ? "text-teal-700"
                                      : "text-red-700"
                                  }  px-2 py-1 rounded-full`}
                                >
                                  {user.active ? "active" : "Inactive"}
                                </span>
                              </div>
                              <h1 className="font-bold text-5xl text-gray-700">
                                {user.name}
                              </h1>
                            </div>
                          </div>
                          <div className="bg-white p-4 grid grid-cols-1 gap-4 rounded-lg shadow-md mt-6">
                            <ListItem>
                              Phone Number
                              <ListItemSuffix>
                                {user.phoneNumber}
                              </ListItemSuffix>
                            </ListItem>
                            <ListItem>
                              E-mail
                              <ListItemSuffix>{user.email}</ListItemSuffix>
                            </ListItem>
                            <ListItem>
                              Gender
                              <ListItemSuffix>{user.gender}</ListItemSuffix>
                            </ListItem>
                            <ListItem>
                              City
                              <ListItemSuffix>{user.city}</ListItemSuffix>
                            </ListItem>
                            <ListItem>
                              Account Created at
                              <ListItemSuffix>
                                {formatDate(user.createdAt)}
                              </ListItemSuffix>
                            </ListItem>
                          </div>
                        </div>
                        {/* Dialog Footer */}
                        <DialogFooter className="flex items-center gap-2 justify-end p-0 py-5">
                          <Button
                            variant="gradient"
                            size="sm"
                            color="deep-orange"
                            onClick={() => {
                              userDeleting(user);
                            }}
                            className="flex items-center gap-1 rounded"
                          >
                            <span>Delete User</span>
                            <AiOutlineUserDelete />
                          </Button>
                          <Button
                            variant="gradient"
                            color="indigo"
                            size="sm"
                            onClick={() => userDeactivating(user)}
                            className="flex items-center gap-1 rounded"
                          >
                            <span>
                              {user.active
                                ? "Deactivate User"
                                : "Activate User"}
                            </span>
                            <FaUserAltSlash />
                          </Button>
                        </DialogFooter>
                      </div>
                    </Dialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceProviders;
