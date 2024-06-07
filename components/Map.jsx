"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { Input } from "@material-tailwind/react";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "40vh",
};
const defaultCenter = {
  lat: 0,
  lng: 0,
};

export default function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [address, setAddress] = useState("");
  const searchBoxRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setLocation(newLocation);
          setMarkerPosition(newLocation);
          getAddress(newLocation);
        },
        (error) => {
          console.error("Error getting the location:", error);
          setLocation(defaultCenter);
        }
      );
    } else {
      console.error("Geolocation not supported");
      setLocation(defaultCenter);
    }
  }, []);

  const getAddress = async ({ lat, lng }) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress("Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Error fetching address");
    }
  };

  const onMapClick = useCallback((event) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    const newLocation = { lat: newLat, lng: newLng };
    setMarkerPosition(newLocation);
    setLocation(newLocation);
    getAddress(newLocation);
  }, []);

  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places.length === 0) return;

    const place = places[0];
    const newLocation = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setMarkerPosition(newLocation);
    setLocation(newLocation);
    getAddress(newLocation);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setLocation(newLocation);
          setMarkerPosition(newLocation);
          getAddress(newLocation);
        },
        (error) => {
          console.error("Error getting the location:", error);
          setLocation(defaultCenter);
        }
      );
    } else {
      console.error("Geolocation not supported");
      setLocation(defaultCenter);
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="text-gray-700">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Your Current Location
      </h1>
      <div className="mb-4 flex gap-4 items-center">
        <div className="w-full">
            <StandaloneSearchBox
              onLoad={(ref) => (searchBoxRef.current = ref)}
              onPlacesChanged={onPlacesChanged}
            >
              <Input
                label="Search for a location"
                className="p-2 w-full border rounded"
              />
            </StandaloneSearchBox>
        </div>
        <button
          onClick={getCurrentLocation}
          className="bg-blue-500 text-sm whitespace-nowrap hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
        >
          Get Current Location
        </button>
      </div>
      <div className="relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={markerPosition}
          onClick={onMapClick}
        >
          {markerPosition && <Marker position={markerPosition} />}
        </GoogleMap>
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold">Address:</h2>
        {address ? <p>{address}</p> : <p>Fetching address...</p>}
        
      </div>
    </div>
  );
}
