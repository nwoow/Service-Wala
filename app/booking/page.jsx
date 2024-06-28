"use client";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import React, { useEffect, useState } from "react";
import axios from "axios";
import UserBooking from "@/components/UserBooking";
import ServiceProviderBooking from "@/components/ServiceProviderBooking";

const Booking = () => {
  const checkingAuthorization = async () => {
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
    if (!data) {
      window.location.href = "/";
    }
  };

  useEffect(() => {
    checkingAuthorization();
  }, []);

  const [user, setUser] = useState({});

  const gettingUser = async () => {
    try {
      const id = localStorage.getItem("token");
      const response = await axios.get(`/api/users/${id}`);
      const data = response.data;
      setUser(data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    gettingUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="w-full">
        <Nav />
      </div>
      {user?.role === "user" ? (
        <UserBooking user={user} />
      ) : (
        <ServiceProviderBooking user={user} />
      )}

      <Footer />
    </div>
  );
};

export default Booking;
