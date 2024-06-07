"use client"
import React, { useEffect } from 'react'

const History = () => {
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
  useEffect(() => {
    chechingAuthorization();
  }, []);
  return (
    <div>History</div>
  )
}

export default History