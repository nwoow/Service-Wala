import React, { useState } from "react";
import emailjs from "emailjs-com";
import { SlSocialFacebook } from "react-icons/sl";
import { PiTwitterLogoLight } from "react-icons/pi";
import { IoLogoInstagram } from "react-icons/io";
import { SlSocialLinkedin } from "react-icons/sl";
import { PiTelegramLogoLight } from "react-icons/pi";
import { Input, Textarea } from "@material-tailwind/react";

const Footer = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const templateParams = {
      to_name: "Recipient Name", // You can set this dynamically if needed
      fullname: formData.fullname,
      phone: formData.phone,
      email: formData.email,
      message: formData.message,
    };

    emailjs
      .send(
        "service_amzk9zb",
        "template_e95jwec",
        templateParams,
        "JjJ9NS_6nst0X7Nbb"
      )
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          alert("Your message has been sent successfully!");
          setFormData({
            fullname: "",
            phone: "",
            email: "",
            message: "",
          });
        },
        (err) => {
          console.log("FAILED...", err);
          alert("There was an error sending your message. Please try again.");
        }
      );
  };

  return (
    <footer className="bg-gray-300 shadow-inner text-black py-10">
      <div className="px-14 flex   justify-between flex-col md:flex-row ">
        {/* Company Description */}
        <div className="md:w-1/3 mb-6 lg:mb-0 px-4 w-full">
          <h2 className="text-2xl items-center font-bold mb-4 flex gap-1">
            <img
              className="h-full w-12 rounded-xl object-cover object-center"
              src="/icon.ico"
              alt="Profile image"
            />{" "}
            Service Wallah
          </h2>
          <p className="mb-4">
            Hi! My name is Dmitrii Rogoza and I’m an expert in web design and
            branding. I can help you make your website more attractive.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              Wisconsin Ave, Suite 700, Chevy Chase, Maryland 20815
            </li>
            <li className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              support@figma.com
            </li>
            <li className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                />
              </svg>
              +1 800 854-36-80
            </li>
          </ul>
        </div>

        {/* Contact Form */}
        <div className="md:w-1/3 w-full mb-6 lg:mb-0">
          <h3 className="text-xl text-center font-bold mb-4">Contact us</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Fullname"
              name="fullname"
              minLength={4}
              maxLength={30}
              value={formData.fullname}
              onChange={handleChange}
            />

            <Input
              label="Phone Number"
              name="phone"
              minLength={10}
              maxLength={10}
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Textarea
              label="Message"
              name="message"
              value={formData.message}
              maxLength={150}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="w-full py-2 bg-black text-white rounded-md"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Company Links */}
        <div className="flex flex-col items-center lg:items-start md:W-1/3 mx-auto w-fit">
          <h3 className="text-xl font-bold mb-4">Company</h3>
          <ul className="space-y-2 text-center lg:text-left">
            <li>About Us</li>
            <li>Services</li>
            <li>FAQs</li>
            <li>Terms & Conditions</li>
            <li>Contact Us</li>
          </ul>
          <div className="mt-4 flex space-x-4 justify-center lg:justify-start">
            <SlSocialFacebook className="w-6 h-6" />
            <PiTwitterLogoLight className="w-6 h-6" />
            <IoLogoInstagram className="w-6 h-6" />
            <PiTelegramLogoLight className="w-6 h-6" />
            <SlSocialLinkedin className="w-6 h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
