"use client";
import { Button, Input } from "@material-tailwind/react";
import { StandaloneSearchBox, LoadScript } from "@react-google-maps/api";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { MdAddLocationAlt, MdDelete, MdLocationOn } from "react-icons/md";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const libraries = ["places"];

const ServiceProviderLocation = ({ serviceProvider }) => {
  const [locations, setLocations] = useState([]);
  const [searchBox, setSearchBox] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Load the search box reference
  const onLoad = (ref) => {
    setSearchBox(ref);
  };

  // Handle places changed event
  const onPlacesChanged = () => {
    const places = searchBox.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const address = place.formatted_address;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setSelectedPlace({ location: address, lat, lng });
    }
  };

  // Load service provider locations on component mount
  useEffect(() => {
    if (serviceProvider) {
      setLocations(serviceProvider.locations);
    }
  }, [serviceProvider]);

  // Add a new location
  const handleAddLocation = async () => {
    if (selectedPlace) {
      const updatedLocations = [...locations, selectedPlace];
      setLocations(updatedLocations);

      const postData = {
        ...serviceProvider,
        locations: updatedLocations,
      };

      await axios.post(
        `/api/service-providers/${serviceProvider._id}/`,
        postData
      );
      setSelectedPlace(null);
    }
  };

  // Delete a location
  const handleDelete = (index) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this location?",
      buttons: [
        {
          label: "No",
        },
        {
          label: "Yes",
          onClick: async () => {
            const updatedLocations = locations.filter((_, i) => i !== index);
            setLocations(updatedLocations);

            const postData = {
              ...serviceProvider,
              locations: updatedLocations,
            };

            await axios.post(
              `/api/service-providers/${serviceProvider._id}/`,
              postData
            );
          },
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
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4 md:mb-0 text-center md:text-left w-full flex items-center">
              <MdLocationOn color="red" size={25} /> Your available locations
            </h2>
            <p className="text-gray-500 text-sm">Your location is only valid within the radius of 15km</p>
          </div>
          <div className="flex gap-2 flex-col md:flex-row w-full md:w-fit">
            <div className="w-full md:w-72">
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
            <Button
              color="blue"
              variant="gradient"
              onClick={handleAddLocation}
              className="flex gap-1 items-center justify-center rounded text-sm whitespace-nowrap"
            >
              Add location
              <MdAddLocationAlt size={18} />
            </Button>
          </div>
        </div>
        {locations?.map((location, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 md:mt-2 bg-gray-100 p-4 rounded-lg"
          >
            <p className="mb-2 md:mb-0 w-full md:w-auto">{location.location}</p>
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
