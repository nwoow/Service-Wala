"use client";
import React from "react";
import {
  Collapse,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Dialog,
  DialogBody,
} from "@material-tailwind/react";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  CardBody,
  Input,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import {
  FaCalendarCheck,
  FaHistory,
  FaInfoCircle,
  FaSearch,
  FaTools,
  FaUser,
} from "react-icons/fa";
import { FaCartShopping, FaLocationDot, FaUsersGear } from "react-icons/fa6";
import {
  IoIosCheckmarkCircle,
  IoIosInformationCircle,
  IoMdOpen,
} from "react-icons/io";
import { AiFillHome, AiFillQuestionCircle } from "react-icons/ai";
import { BiLogIn } from "react-icons/bi";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MdDashboardCustomize,
  MdLockPerson,
  MdManageAccounts,
  MdOutlineManageHistory,
  MdOutlinePayment,
} from "react-icons/md";
import {
  IoLogOut,
  IoPersonCircleOutline,
  IoSendSharp,
  IoShieldCheckmark,
} from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import Fuse from "fuse.js";
import Map from "./Map";
import { RiLoginCircleFill } from "react-icons/ri";

const services = [
  {
    title: "Home",
    icon: AiFillHome,
    link: "/",
  },
  {
    title: "All Services",
    icon: FaTools,
    link: "/services",
  },
  {
    title: "About",
    icon: IoIosInformationCircle,
    link: "/about",
  },
];
function ServicesList() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderItems = services.map(({ title, icon, link }, key) => (
    <Link href={link} key={key}>
      <MenuItem className="flex items-center justify-between gap-3 rounded-lg ">
        <div>
          <Typography
            variant="h6"
            color="blue-gray"
            className="flex items-center text-gray-700 text-sm font-bold"
          >
            {title}
          </Typography>
        </div>
        <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
          {" "}
          {React.createElement(icon, {
            strokeWidth: 2,
            className: "h-6 text-gray-700 w-6",
          })}
        </div>
      </MenuItem>
    </Link>
  ));

  return (
    <>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={true}
      >
        <MenuHandler>
          <Typography as="div" variant="small" className="font-medium">
            <ListItem
              className="flex items-center gap-2 py-2 pr-4 font-medium text-gray-900 bg-white border h-full justify-center border-gray-300 rounded-md shadow"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              Go to
              <ChevronDownIcon
                strokeWidth={3.5}
                className={`hidden h-3 w-3 transition-transform lg:block text-[#582FFF]  ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block h-3 w-3 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList className="hidden max-w-screen-xl rounded lg:block">
          <ul className="grid grid-cols-1 gap-y-2 outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </>
  );
}

function NavList() {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);

  const handleOpen = () => setOpen(!open);
  const handleOpen2 = () => setOpen2(!open2);

  const [topServices, setTopServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [searchedData, setSearchedData] = useState([]);
  const [searchError, setSearchError] = useState("");
  const gettingServices = async () => {
    try {
      const fetchedData = await fetch("/api/services", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await fetchedData.json();
      function getTopBookedServices(services, topN) {
        return services
          .sort((a, b) => b.bookings.length - a.bookings.length)
          .filter((service) => service.status === "active")
          .slice(0, topN);
      }

      const topBookedServices = getTopBookedServices(response, 6);
      setAllServices(response);
      setTopServices(topBookedServices);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    gettingServices();
  }, []);

  const fuseOptions = {
    keys: ["name", "subServices.name"],
    includeScore: true,
    threshold: 0.3,
  };

  // Flatten the data array to include both services and their sub-services
  const flattenedData = allServices.flatMap((service) => [
    service,
    ...service.subServices.map((subService) => ({
      ...subService,
      parentServiceName: service.name,
      parentServiceId: service._id,
    })),
  ]);

  const fuse = new Fuse(flattenedData, fuseOptions);
  function handleSerch(query) {
    if (!query) {
      setSearchError("");
      setSearchedData([]);
      return;
    }

    const result = fuse.search(query);

    if (result.length === 0) {
      setSearchError("No matching service found");
    }
    setSearchedData(result);
  }
  const [address, setAddress] = useState("");
  const getAddress = async ({ lat, lng }) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].address_components[1].short_name);
        // console.log(data.results[0].address_components);
      } else {
        setAddress("Address not found");
        console.log("Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Error fetching address");
    }
  };
  useEffect(() => {
    const location = JSON.parse(localStorage.getItem("location"));
    if (location) {
      getAddress(location);
    }
  }, []);
  return (
    <List className="mt-4 mb-6 p-0 lg:mt-0 lg:mb-0 lg:flex-row lg:p-1 md:gap-4">
      <ServicesList />
      <div className="flex gap-2 justify-evenly">
        <Link
          href={"/location"}
          // onClick={handleOpen}
          variant="gradient"
          className="flex gap-2 w-full border bg-white border-gray-300 hover:bg-gray-200 shadow py-2 px-4 rounded-md justify-center items-center"
        >
          {address ? address : "Location"}
          <FaLocationDot size={18} color="#F44336" />
        </Link>
        <Dialog
          size="lg"
          open={open}
          handler={handleOpen}
          className="bg-gray-100"
          animate={{
            mount: { scale: 1, y: 0 },
            unmount: { scale: 0.9, y: -100 },
          }}
        >
          <DialogBody>
            <Map />
          </DialogBody>
        </Dialog>

        <button
          onClick={handleOpen2}
          variant="gradient"
          className="flex gap-2 border bg-white border-gray-300 hover:bg-gray-200 shadow py-3 px-4 rounded-full justify-center items-center"
        >
          <FaSearch />
        </button>

        <div className="relative">
          {/* <span className="bg-teal-400 w-5 h-5 text-xs text-white rounded-full absolute top-0 right-0 flex justify-center items-center">
            {cartCount}
          </span> */}
          <Link
            href={"/cart"}
            variant="gradient"
            className="flex gap-2 border bg-white border-gray-300 hover:bg-gray-200 shadow py-3 px-3 rounded-full justify-center items-center"
          >
            <FaCartShopping size={20} />
          </Link>
        </div>
        <Dialog
          open={open2}
          size="lg"
          handler={handleOpen2}
          animate={{
            mount: { scale: 1, y: 0 },
            unmount: { scale: 0.9, y: -100 },
          }}
        >
          <DialogBody className="p-10 min-h-[90vh] bg-gray-100 rounded-xl">
            <div className="flex gap-3 mb-4 md:mb-10 justify-center items-center">
              <h1 className="text-2xl md:text-4xl font-julius uppercase">
                Search For Service
              </h1>
              <h2 className="text-3xl md:text-5xl font-cookie text-blue-500">
                You like
              </h2>
            </div>
            <Input
              label="Search a Service"
              color="blue"
              onChange={(e) => handleSerch(e.target.value)}
              icon={<FaSearch className="cursor-pointer text-blue-500" />}
            />
            <div>
              <div className="flex gap-2 items-center my-4">
                <h2 className="whitespace-nowrap text-gray-500 text-xs">
                  Most Booked Services You may like
                </h2>
                <div className="h-px bg-gray-300 w-full"></div>
              </div>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 h-96 overflow-auto no-scrollbar">
                {searchError ? (
                  <div>{searchError}</div>
                ) : searchedData.length <= 0 ? (
                  topServices.map((service, index) => {
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-lg py-4 px-4"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={service.icon.url}
                            alt={service.name}
                            className="w-10 h-10 md:w-16 md:h-16 rounded-md"
                          />
                          <div className="flex flex-col items-center gap-1 w-full">
                            <h2 className="text-gray-700 font-julius font-semibold text-center">
                              {service.name}
                            </h2>
                            {/* <p className="text-gray-500">{service.name}</p> */}
                            <Link href={`/services/${service._id}`}>
                              <Button
                                variant="gradient"
                                color="blue"
                                className="rounded w-full flex items-center gap-1"
                                size="sm"
                              >
                                View <IoMdOpen />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  searchedData.map((service, index) => {
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-lg py-4 px-4 h-fit"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={service.item.icon.url}
                            alt={service.item.name}
                            className="w-10 h-10 md:w-16 md:h-16 rounded-md"
                          />
                          <div className="flex flex-col items-center gap-1 w-full">
                            <h2 className="text-gray-700 font-julius font-semibold text-center">
                              {service.item.name}
                            </h2>
                            {/* <p className="text-gray-500">{service.item.name}</p> */}
                            <Link
                              href={`/services/${
                                service.item.parentServiceId
                                  ? service.item.parentServiceId
                                  : service.item._id
                              }`}
                            >
                              <Button
                                variant="gradient"
                                color="blue"
                                className="rounded w-full flex items-center gap-1"
                                size="sm"
                              >
                                View <IoMdOpen />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </DialogBody>
        </Dialog>
      </div>
    </List>
  );
}

export default function Nav() {
  const [openNav, setOpenNav] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [user, setUser] = useState({
    image: {
      url: "",
      name: "",
    },
  });
  const gettingUser = async () => {
    const id = localStorage.getItem("token");
    const response = await fetch(`/api/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    // console.log(data);
    setUser(data);
  };
  const [registerData, setRegisterData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({
    phoneNumber: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginData.phoneNumber || !loginData.password) {
      setErrorMessage("Invalid data");
      return;
    }
    try {
      const response = await fetch(
        "/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        },
        { cache: "no-store" }
      );
      const data = await response.json();
      // console.log({ data });
      if (data.status !== 400) {
        localStorage.setItem("token", data._id);
        setOpen3(false);
        setLoginData({
          phoneNumber: "",
          password: "",
        });
        setErrorMessage("");
        gettingUser();
      } else {
        setErrorMessage(data.message);
      }
    } catch {
      setErrorMessage(
        `Something went wrong while logging ${loginData.phoneNumber}`
      );
    }
  }
  // Registration
  const [open4, setOpen4] = useState(false);
  const handleOpen4 = () => setOpen4(!open4);
  const [registerError, setRegisterError] = useState("");
  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setOtp(e.target.value);
  };
  function generateOTP() {
    // Generate a random number between 1000 and 9999
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString();
  }
  const [generatedOTP, setGeneratedOtp] = useState();
  const [type, setType] = useState("card");
  const SendingOtp = async () => {
    if (
      !registerData.name ||
      !registerData.phoneNumber ||
      !registerData.password
    ) {
      setRegisterError("Invalid data");
      return;
    }
    const authkey = "15d7c1359e59f369";
    const name = "service wallah account";
    const mobile = registerData.phoneNumber;
    const country_code = "+91";
    const SID = "13608";
    const otp = generateOTP();
    setGeneratedOtp(otp);
    const url = `https://api.authkey.io/request?authkey=${authkey}&mobile=${mobile}&country_code=${country_code}&sid=${SID}&company=${name}&otp=${otp}`;
    await axios.get(url);
    setOpen4(true);
  };
  async function handleRegister(e) {
    e.preventDefault();
    if (
      !registerData.name ||
      !registerData.phoneNumber ||
      !registerData.password
    ) {
      setRegisterError("Invalid data");
      return;
    }
    try {
      if (otp === undefined || otp !== generatedOTP) {
        setRegisterError("Invalid OTP");
        return;
      }
      const response = await fetch(
        "/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        },
        { cache: "no-store" }
      );
      await response.json();
      const loginResponse = await fetch(
        "/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: registerData.phoneNumber,
            password: registerData.password,
          }),
        },
        { cache: "no-store" }
      );
      const data = await loginResponse.json();
      // console.log({ data });
      if (data.status !== 400) {
        localStorage.setItem("token", data._id);
        gettingUser();
        if (response.ok) {
          setRegisterError("");
          setOpen4(false);
          setOpen3(false);
          setRegisterData({
            name: "",
            phoneNumber: "",
            email: "",
            password: "",
          });
        }
      }
    } catch (err) {
      setRegisterError(`Something went wrong while Regestering`);
    }
  }
  useEffect(() => {
    const id = localStorage.getItem("token");
    if (id) {
      gettingUser();
    }
  }, []);
  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);
  const handleOpen3 = () => setOpen3(!open3);

  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const handleOpenForgotPassword = () =>
    setOpenForgotPassword(!openForgotPassword);

  const [forgotPasswordGneratedOTP, setForgotPasswordGeneratedOtp] =
    useState(0);
  const [forgetPasswordNumber, setForgetPasswordNumber] = useState("");
  const [otpSended, setOtpSended] = useState(false);
  const [forgotPasswordOtpVerified, setForgotPasswordOtpVerified] =
    useState(false);
  const handleThrowingOtp = async () => {
    if (forgetPasswordNumber.length != 10) return;
    const authkey = "15d7c1359e59f369";
    const name = "service wallah account";
    const mobile = forgetPasswordNumber;
    const country_code = "+91";
    const SID = "13608";
    const otp = generateOTP();
    setForgotPasswordGeneratedOtp(otp);
    const url = `https://api.authkey.io/request?authkey=${authkey}&mobile=${mobile}&country_code=${country_code}&sid=${SID}&company=${name}&otp=${otp}`;
    await axios.get(url);
    setOtpSended(true);
  };
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [updatedPasswordError, setUpdatedPasswordError] = useState(false);
  const verifyingOtp = async (otp) => {
    if (otp === forgotPasswordGneratedOTP) {
      setForgotPasswordOtpVerified(true);
    }
  };
  const handleUpdatePassword = async () => {
    try {
      const response = await axios.put("/api/users/update", {
        password: updatedPassword,
        phoneNumber: forgetPasswordNumber,
      });

      if (response.status === 201) {
        setOpenForgotPassword(false);
        setLoginData({...loginData, phoneNumber: forgetPasswordNumber})
        setForgotPasswordGeneratedOtp(0);
        setForgotPasswordOtpVerified(false);
        setOtpSended(false);
        setUpdatedPassword("");
        setUpdatedPasswordError(false);
      } else {
        throw new Error("Failed to update password");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-full px-4 py-2 rounded-none shadow-none bprder-none bg-transparent z-50">
      <div className="flex items-center justify-between text-blue-gray-900 bg-transparent">
        <Link
          href={"/"}
          className="mr-4 cursor-pointer font-extrabold py-1.5 lg:ml-2"
        >
          <img
            src="/logo/secoundary-logo-black.png"
            alt="logo"
            className="cursor-pointer w-40 object-cover"
          />
          {/* Service Wallah */}
        </Link>
        <div className="hidden gap-2 lg:flex lg:items-center lg:justify-end w-full">
          <NavList />
          {user?.role ? (
            <Menu allowHover={true} placement="bottom-start">
              <MenuHandler>
                {user?.image?.url ? (
                  <img
                    src={user.image.url}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex justify-center items-center font-junge bg-gray-400 cursor-pointer">
                    {user.name && Array.from(user.name)[0].toUpperCase()}
                  </div>
                )}
              </MenuHandler>
              {user.role === "user" ? (
                <MenuList>
                  <Link href={`/user`} className="outline-none">
                    <MenuItem className="justify-center flex items-center gap-1">
                      Profile <FaUser size={12} />
                    </MenuItem>
                  </Link>
                  <Link href={`/booking`} className="outline-none">
                    <MenuItem className="justify-center flex items-center gap-1">
                      Booking <FaCalendarCheck />
                    </MenuItem>
                  </Link>
                  <Link href={`/user/history`} className="outline-none">
                    <MenuItem className="justify-center flex items-center gap-1">
                      History <FaHistory />
                    </MenuItem>
                  </Link>
                  <MenuItem
                    className="text-red-400 justify-center flex items-center gap-1"
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.reload();
                    }}
                  >
                    Logout <IoLogOut />
                  </MenuItem>
                </MenuList>
              ) : user.role === "service-provider" ? (
                <MenuList>
                  <Link
                    href={`/service-provider/${user._id}`}
                    className="outline-none"
                  >
                    <MenuItem className="justify-center flex items-center gap-1">
                      Profile <FaUser size={12} />
                    </MenuItem>
                  </Link>
                  <Link href={`/booking`} className="outline-none">
                    <MenuItem className="justify-center flex items-center gap-1">
                      Booking <FaCalendarCheck />
                    </MenuItem>
                  </Link>
                  <Link
                    href={`/service-provider/${user._id}/history`}
                    className="outline-none"
                  >
                    <MenuItem className="justify-center flex items-center gap-1">
                      History <FaHistory />
                    </MenuItem>
                  </Link>
                  <MenuItem
                    className="text-red-400 justify-center flex items-center gap-1"
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.reload();
                    }}
                  >
                    Logout <IoLogOut />
                  </MenuItem>
                </MenuList>
              ) : (
                <MenuList>
                  <Link href={`/admin`} className="outline-none">
                    <MenuItem className="justify-center flex items-center gap-1">
                      Dashboard <MdDashboardCustomize />
                    </MenuItem>
                  </Link>
                  <Link href={`/admin/services`} className="outline-none">
                    <MenuItem className="justify-center flex items-center gap-1">
                      Manage Services <MdOutlineManageHistory />
                    </MenuItem>
                  </Link>
                  <Link href={`/admin/users`} className="outline-none">
                    <MenuItem className="justify-center flex items-center gap-1">
                      Manage Users <MdManageAccounts />
                    </MenuItem>
                  </Link>
                  <Link
                    href={`/admin/service-providers`}
                    className="outline-none"
                  >
                    <MenuItem className="justify-center flex items-center gap-1">
                      Service Provider <FaUsersGear />
                    </MenuItem>
                  </Link>
                  <Link href={`/admin/payments`} className="outline-none">
                    <MenuItem className="justify-center flex items-center gap-1">
                      Manage Payments <MdOutlinePayment />
                    </MenuItem>
                  </Link>
                  <MenuItem
                    className="text-red-400 justify-center flex items-center gap-1"
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.reload();
                    }}
                  >
                    Logout <IoLogOut />
                  </MenuItem>
                </MenuList>
              )}
            </Menu>
          ) : (
            <button
              onClick={handleOpen3}
              variant="gradient"
              className="flex gap-1 border border-gray-300 shadow py-2 px-4 rounded-md hover:bg-[#393737bf] h-11 justify-center items-center text-white text-sm bg-[#000000BF]"
              size="sm"
            >
              Log In <BiLogIn size={18} />
            </button>
          )}

          <Dialog
            open={open3}
            handler={handleOpen3}
            size="sm"
            animate={{
              mount: { scale: 1, y: 0 },
              unmount: { scale: 0.9, y: -100 },
            }}
          >
            <CardBody>
              <Tabs value={type} className="">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-md text-center flex gap-1 items-center text-gray-800">
                    Login / Register <IoPersonCircleOutline size={24} />
                  </h1>
                  <IconButton
                    variant="text"
                    onClick={handleOpen3}
                    className="cursor-pointer"
                  >
                    <RxCross1 size={20} />
                  </IconButton>
                </div>

                <TabsHeader className="relative z-0 ">
                  <Tab value="card" onClick={() => setType("card")}>
                    LogIn
                  </Tab>
                  <Tab value="paypal" onClick={() => setType("paypal")}>
                    Register Now
                  </Tab>
                </TabsHeader>
                <TabsBody
                  className="!overflow-x-hidden"
                  animate={{
                    initial: {
                      x: type === "card" ? 400 : -400,
                    },
                    mount: {
                      x: 0,
                    },
                    unmount: {
                      x: type === "card" ? 400 : -400,
                    },
                  }}
                >
                  <TabPanel value="card" className="p-0">
                    <form
                      className="flex flex-col gap-4 justify-center h-[35vh]"
                      onSubmit={handleLogin}
                    >
                      <div className="w-full ">
                        <Input
                          type="tel"
                          label="Phone Number"
                          minLength={10}
                          maxLength={10}
                          value={loginData.phoneNumber}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              phoneNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="w-full">
                        <Input
                          type="password"
                          label="Password"
                          required
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                        />
                        <Typography
                          variant="small"
                          color="gray"
                          className="mt-2 flex flex-col justify-center gap-1 font-normal"
                        >
                          <span className="flex gap-1 items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="-mt-px h-4 w-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Password should be more than 10 characters long
                            including letters and numbers
                          </span>
                          {errorMessage && (
                            <span className="text-red-500 flex gap-1 items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="-mt-px h-4 w-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {errorMessage}
                            </span>
                          )}
                        </Typography>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          fullWidth
                          size="lg"
                          type="submit"
                          variant="outlined"
                          color="blue-gray"
                          onClick={handleOpenForgotPassword}
                        >
                          Forgot Password?
                        </Button>
                        <Dialog
                          size="xs"
                          className="p-6 h-60 overflow-hidden"
                          dismiss={{ enabled: false }}
                          handler={handleOpenForgotPassword}
                          open={openForgotPassword}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h1 className="text-md text-center flex gap-1 items-center text-blue-800">
                              Forgot password
                              <AiFillQuestionCircle size={20} />
                            </h1>
                            <IconButton
                              variant="text"
                              onClick={handleOpenForgotPassword}
                              className="cursor-pointer"
                            >
                              <RxCross1 size={20} />
                            </IconButton>
                          </div>
                          <div className="relative">
                            <div
                              className={`w-full flex flex-col gap-2 transition-all duration-500 absolute ${
                                forgotPasswordOtpVerified
                                  ? "-translate-x-[26rem]"
                                  : "-translate-x-0"
                              }`}
                            >
                              <Input
                                onChange={(e) =>
                                  setForgetPasswordNumber(e.target.value)
                                }
                                label="Enter Your Phone Number"
                                required
                                minLength={10}
                                maxLength={10}
                              />
                              <Input
                                label="Enter OTP"
                                required
                                disabled={!otpSended}
                                minLength={4}
                                maxLength={4}
                                onChange={(e) => verifyingOtp(e.target.value)}
                              />
                              <Button
                                onClick={handleThrowingOtp}
                                variant="gradient"
                                disabled={otpSended}
                                color="blue"
                                className="flex gap-2 items-center justify-center"
                                fullWidth
                              >
                                Send OTP <IoSendSharp />
                              </Button>
                            </div>
                            <div
                              className={`flex flex-col items-center gap-2 transition-all duration-500 w-full absolute ${
                                forgotPasswordOtpVerified
                                  ? "translate-x-0"
                                  : "translate-x-[26rem]"
                              }`}
                            >
                              <Input
                                label="Enter New Password"
                                minLength={10}
                                type="password"
                                maxLength={25}
                                required
                                color="blue"
                                onChange={(e) =>
                                  setUpdatedPassword(e.target.value)
                                }
                              />
                              <Input
                                label="Enter Password again"
                                minLength={10}
                                type="password"
                                maxLength={25}
                                required
                                color="blue"
                                error={updatedPasswordError}
                                onChange={(e) => {
                                  if (e.target.value !== updatedPassword) {
                                    setUpdatedPasswordError(true);
                                  } else {
                                    setUpdatedPasswordError(false);
                                  }
                                }}
                              />
                              <Button
                                onClick={handleUpdatePassword}
                                variant="gradient"
                                disabled={updatedPasswordError}
                                color="blue"
                                className="flex gap-2 items-center justify-center"
                                fullWidth
                              >
                                Update Password
                                <IoIosCheckmarkCircle size={20} />
                              </Button>
                            </div>
                          </div>
                        </Dialog>
                        <Button
                          fullWidth
                          size="lg"
                          type="submit"
                          variant="gradient"
                          color="blue"
                          className="flex gap-1 items-center justify-center"
                        >
                          Login <RiLoginCircleFill size={20} />
                        </Button>
                      </div>
                    </form>
                  </TabPanel>
                  <TabPanel value="paypal" className="p-0">
                    <div className="mt-7 flex flex-col gap-4 ">
                      <div className="w-full">
                        <Input
                          label="Fullname"
                          value={registerData.name}
                          minLength={4}
                          maxLength={30}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="w-full">
                        <Input
                          type="tel"
                          label="Phone Number"
                          minLength={10}
                          maxLength={10}
                          value={registerData.phoneNumber}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              phoneNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="relative flex w-full max-w-full">
                        <Input
                          type="email"
                          label="Email Address"
                          required
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              email: e.target.value,
                            })
                          }
                          className="pr-20"
                          containerProps={{
                            className: "min-w-0",
                          }}
                        />
                      </div>
                      <div className="w-full">
                        <Input
                          type="password"
                          label="Password"
                          required
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                        />
                        <Typography
                          variant="small"
                          color="gray"
                          className="mt-2 flex flex-col justify-center gap-1 font-normal"
                        >
                          <span className="flex gap-1 items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="-mt-px h-4 w-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Password should be more than 10 characters long
                            including letters and numbers
                          </span>
                          {registerError && (
                            <span className="text-red-500 flex gap-1 items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="-mt-px h-4 w-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {registerError}
                            </span>
                          )}
                        </Typography>
                      </div>

                      <Button
                        onClick={SendingOtp}
                        variant="gradient"
                        fullWidth
                        size="lg"
                        color="blue"
                        className="flex gap-1 items-center justify-center"
                      >
                        Verify Number <IoShieldCheckmark size={20} />
                      </Button>
                    </div>
                  </TabPanel>
                </TabsBody>
              </Tabs>
            </CardBody>
          </Dialog>
          <Dialog
            open={open4}
            handler={handleOpen4}
            size="xs"
            dismiss={{ enabled: false }}
            animate={{
              mount: { scale: 1, y: 0 },
              unmount: { scale: 0.9, y: -100 },
            }}
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">
                Verify OTP
              </h2>
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <Input
                  label="Enter OTP"
                  maxLength={4}
                  color="blue"
                  value={otp}
                  size="lg"
                  minLength={4}
                  onChange={handleChange}
                />
                {registerError && (
                  <p className="text-red-500 flex gap-1 text-xs items-center">
                    <FaInfoCircle />
                    <span>{registerError}</span>
                  </p>
                )}
                <p className="text-gray-600 flex gap-1 text-xs items-center">
                  <FaInfoCircle />{" "}
                  <span>
                    Please enter the 4-digit OTP sent to your mobile number{" "}
                    {registerData.phoneNumber}.
                  </span>
                </p>

                <button
                  type="submit"
                  className="w-full bg-blue-400 text-white p-3 rounded hover:bg-blue-600 transition duration-200"
                >
                  Verify OTP
                </button>
              </form>
            </div>
          </Dialog>
        </div>
        <div className="flex items-center justify-end gap-1">
          <IconButton
            variant="text"
            color="blue-gray"
            className="lg:hidden"
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-6 w-6" strokeWidth={2} />
            )}
          </IconButton>
          <div className="flex w-fit items-center gap-2 lg:hidden">
            {user?.role ? (
              <Menu allowHover={true} placement="bottom-start">
                <MenuHandler>
                  {user?.image?.url ? (
                    <img
                      src={user.image.url}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover cursor-pointer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex justify-center items-center font-junge bg-gray-400 cursor-pointer">
                      {user.name && Array.from(user.name)[0].toUpperCase()}
                    </div>
                  )}
                </MenuHandler>
                {user.role === "user" ? (
                  <MenuList>
                    <Link href={`/user`} className="outline-none">
                      <MenuItem className="justify-center flex items-center gap-1">
                        Profile <FaUser size={12} />
                      </MenuItem>
                    </Link>
                    <Link href={`/user/booking`} className="outline-none">
                      <MenuItem className="justify-center flex items-center gap-1">
                        Booking <FaCalendarCheck />
                      </MenuItem>
                    </Link>
                    <Link href={`/user/history`} className="outline-none">
                      <MenuItem className="justify-center flex items-center gap-1">
                        History <FaHistory />
                      </MenuItem>
                    </Link>
                    <MenuItem
                      className="text-red-400 justify-center flex items-center gap-1"
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.reload();
                      }}
                    >
                      Logout <IoLogOut />
                    </MenuItem>
                  </MenuList>
                ) : user.role === "service-provider" ? (
                  <MenuList>
                    <Link
                      href={`/service-provider/${user._id}`}
                      className="outline-none"
                    >
                      <MenuItem className="justify-center flex items-center gap-1">
                        Profile <FaUser size={12} />
                      </MenuItem>
                    </Link>
                    <Link
                      href={`/service-provider/${user._id}/booking`}
                      className="outline-none"
                    >
                      <MenuItem className="justify-center flex items-center gap-1">
                        Booking <FaCalendarCheck />
                      </MenuItem>
                    </Link>
                    <Link
                      href={`/service-provider/${user._id}/history`}
                      className="outline-none"
                    >
                      <MenuItem className="justify-center flex items-center gap-1">
                        History <FaHistory />
                      </MenuItem>
                    </Link>
                    <MenuItem
                      className="text-red-400 justify-center flex items-center gap-1"
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.reload();
                      }}
                    >
                      Logout <IoLogOut />
                    </MenuItem>
                  </MenuList>
                ) : (
                  <MenuList>
                    <Link href={`/admin`} className="outline-none">
                      <MenuItem className="justify-center flex items-center gap-1">
                        Dashboard <MdDashboardCustomize />
                      </MenuItem>
                    </Link>
                    <Link href={`/admin/services`} className="outline-none">
                      <MenuItem className="justify-center flex items-center gap-1">
                        Manage Services <MdOutlineManageHistory />
                      </MenuItem>
                    </Link>
                    <Link href={`/admin/users`} className="outline-none">
                      <MenuItem className="justify-center flex items-center gap-1">
                        Manage Users <MdManageAccounts />
                      </MenuItem>
                    </Link>
                    <Link
                      href={`/admin/service-providers`}
                      className="outline-none"
                    >
                      <MenuItem className="justify-center flex items-center gap-1">
                        Service Provider <FaUsersGear />
                      </MenuItem>
                    </Link>
                    <Link href={`/admin/payments`} className="outline-none">
                      <MenuItem className="justify-center flex items-center gap-1">
                        Manage Payments <MdOutlinePayment />
                      </MenuItem>
                    </Link>
                    <MenuItem
                      className="text-red-400 justify-center flex items-center gap-1"
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.reload();
                      }}
                    >
                      Logout <IoLogOut />
                    </MenuItem>
                  </MenuList>
                )}
              </Menu>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                fullWidth
                onClick={handleOpen3}
              >
                Log In
              </Button>
            )}
          </div>
        </div>
      </div>
      <Collapse open={openNav}>
        <NavList />
      </Collapse>
    </div>
  );
}
