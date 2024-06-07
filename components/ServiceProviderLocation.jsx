"use client";
import { Input } from "@material-tailwind/react";
import { StandaloneSearchBox, LoadScript } from "@react-google-maps/api";
import axios from "axios";
import React, { useRef, useState } from "react";
import { MdDelete } from "react-icons/md";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const libraries = ["places"];

const ServiceProviderLocation = () => {
  const [locations, setLocations] = useState([]);
  const [searchBox, setSearchBox] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const onLoad = (ref) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    const places = searchBox.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const address = place.formatted_address;
      setSelectedPlace(address);
    }
  };

  const handleAddLocation = () => {
    if (selectedPlace) {
      setLocations((prev) => [...prev, selectedPlace]);
      setSelectedPlace(null);
    }
  };

  const handleDelete = (index) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this location?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            setLocations((prev) => prev.filter((_, i) => i !== index));
          },
        },
        {
          label: "No",
        },
      ],
    });
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div className="bg-white p-4 py-6 rounded shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 md:mb-0">
            Your available locations
          </h2>
          <div className="flex gap-2 full">
            <div className="w-72">
              <StandaloneSearchBox
                onLoad={onLoad}
                onPlacesChanged={onPlacesChanged}
              >
                <Input
                  label="Search for a location"
                  size="lg"
                  className="p-2 w-full border rounded"
                />
              </StandaloneSearchBox>
            </div>
            <button
              onClick={handleAddLocation}
              className="px-4 py-2 whitespace-nowrap bg-gray-800 text-white font-bold rounded shadow"
            >
              Add location
            </button>
          </div>
        </div>
        {locations.map((location, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 md:mt-2 bg-gray-100 p-4 rounded-lg"
          >
            <p className="mb-2 md:mb-0 w-full md:w-auto">{location}</p>
            <button
              onClick={() => handleDelete(index)}
              className="bg-red-500 text-white flex justify-center gap-1.5 px-4 w-fit py-2 rounded-md items-center"
            >
              Delete
              <MdDelete size={20} />
            </button>
          </div>
        ))}
      </div>
    </LoadScript>
  );
};

export default ServiceProviderLocation;
