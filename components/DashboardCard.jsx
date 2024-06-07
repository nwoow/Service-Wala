import React from "react";

const Card = ({ label, value, bgColor, textColor, image }) => (
  <div
    className={`${bgColor} ${textColor} p-6 rounded-lg shadow-lg flex gap-4 items-center`}
  >
    <img src={image} alt="" />
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div>{label}</div>
    </div>
  </div>
);
const DashboardCard = ({ data }) => {
  const cardData = [
    {
      id: 1,
      label: "Total Services",
      value: data.totalServices,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
      image: "admin-logos/total-services.svg",
    },
    {
      id: 2,
      label: "InActive Services",
      value: data.inactiveServices,
      bgColor: "bg-deep-orange-100",
      textColor: "text-deep-orange-700",
      image: "admin-logos/inactive-services.svg",
    },
    {
      id: 3,
      label: "Active Services",
      value: data.activeServices,
      bgColor: "bg-cyan-100",
      textColor: "text-cyan-700",
      image: "admin-logos/active-services.svg",
    },
    {
      id: 4,
      label: "Total Sub Services",
      value: data.totalSubServices,
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      image: "admin-logos/total-sub-services.svg",
    },
    {
      id: 5,
      label: "Total Users",
      value: data.totalUsers,
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-700",
      image: "admin-logos/total-users.svg",
    },
    {
      id: 6,
      label: "Active Users",
      value: data.activeUsers,
      bgColor: "bg-light-blue-100",
      textColor: "text-light-blue-700",
      image: "admin-logos/active-users.svg",
    },
    {
      id: 7,
      label: "Total Service Providers",
      value: data.totalServiceProviders,
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
      image: "admin-logos/total-service-provider.svg",
    },
    {
      id: 8,
      label: "Active Service Providers",
      value: data.activeServiceProviders,
      bgColor: "bg-teal-100",
      textColor: "text-teal-700",
      image: "admin-logos/active-service-provider.svg",
    },
  ];
  return (
    <>
      {cardData.map(({ id, label, value, bgColor, textColor, image }) => (
        <Card
          key={id}
          label={label}
          value={value}
          bgColor={bgColor}
          textColor={textColor}
          image={image}
        />
      ))}
    </>
  );
};

export default DashboardCard;
