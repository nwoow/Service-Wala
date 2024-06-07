"use client"
import React, { useEffect } from 'react'

const Payments = () => {
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
  useEffect(() => {
    chechingAuthorization();
  }, []);
  return (
    <div>Payments</div>
  )
}

export default Payments