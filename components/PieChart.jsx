import React from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const PieChart = ({ data }) => {
  const chartData = {
    labels: [
      "Total Services",
      "Inactive Services",
      "Active Services",
      "Total Sub Services",
      "Total Users",
      "Active Users",
      "Total Service Providers",
      "Active Service Providers",
    ],
    datasets: [
      {
        data: [
          data.totalServices,
          data.inactiveServices,
          data.activeServices,
          data.totalSubServices,
          data.totalUsers,
          data.activeUsers,
          data.totalServiceProviders,
          data.activeServiceProviders,
        ],
        backgroundColor: [
          "rgba(255, 206, 86, 0.5)", // yellow
          "rgba(255, 87, 34, 0.5)", // deep-orange
          "#67e8f9", // cyan
          "rgba(75, 192, 192, 0.5)", // green
          "#a5b4fc", // indigo
          "rgba(30, 144, 255, 0.5)", // light blue
          "#d8b4fe", // purple
          "rgba(0, 128, 128, 0.5)", // teal
        ],
        borderColor: [
          "rgba(255, 206, 86, 1)", // yellow
          "rgba(255, 87, 34, 1)", // deep-orange
          "#0e7490", // cyan
          "rgba(75, 192, 192, 1)", // green
          "#4338ca", // indigo
          "rgba(30, 144, 255, 1)", // light blue
          "#7e22ce", // purple
          "rgba(0, 128, 128, 1)", // teal
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        //   display: false
      },
      title: {
        display: false,
        text: "Pie Chart Example",
      },
    },
  };
  return <Pie data={chartData} options={options} />;
};

export default PieChart;
