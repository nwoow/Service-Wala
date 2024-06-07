"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { Button, Input } from "@material-tailwind/react";
import { FaLocationCrosshairs } from "react-icons/fa6";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "60vh",
};
const defaultCenter = {
  lat: 0,
  lng: 0,
};

export default function Location() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [address, setAddress] = useState("");
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const storedLocation = JSON.parse(localStorage.getItem("location"));
    if (storedLocation) {
      setLocation(storedLocation);
      setMarkerPosition(storedLocation);
      getAddress(storedLocation);
    } else {
      askForGeolocation();
    }
  }, []);

  const askForGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setLocation(newLocation);
          setMarkerPosition(newLocation);
          getAddress(newLocation);
          localStorage.setItem("location", JSON.stringify(newLocation));
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
    localStorage.setItem("location", JSON.stringify(newLocation));
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
    localStorage.setItem("location", JSON.stringify(newLocation));
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
          localStorage.setItem("location", JSON.stringify(newLocation));
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
  if (!isLoaded)
    return (
      <div
        className={`grid place-items-center min-h-screen absolute w-full bg-white transition-all duration-700 top-0 ${
          !isLoaded ? "opacity-100" : "opacity-0"
        } ${!isLoaded ? "z-50" : "-z-50"}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="loaction-loader"></div>
          <div className="text-2xl font-julius">Loading</div>
        </div>
      </div>
    );

  return (
    <>
      <Nav />
      <div
        className={`${
          !isLoaded ? "hidden" : "bloack"
        } min-h-screen flex justify-center mb-6 items-center transition-all duration-700`}
      >
        <div className="md:w-10/12 w-full md:bg-white p-4 md:p-6 rounded-xl md:shadow-lg text-gray-700">
          <div className="mt-4 p-4 border bg-white rounded-lg shadow mb-4">
            <h2 className="text-xl font-semibold">Your Current Location</h2>
            {address ? (
              <p className="text-blue-600 text-sm">{address}</p>
            ) : (
              <p className="text-blue-600 text-sm">Fetching address...</p>
            )}
          </div>
          <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full bg-white">
              <StandaloneSearchBox
                onLoad={(ref) => (searchBoxRef.current = ref)}
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
              onClick={getCurrentLocation}
              color="blue"
              variant="gradient"
              className="w-full md:w-fit whitespace-nowrap flex gap-2 items-center rounded"
            >
              Get Current Location <FaLocationCrosshairs size={22} />
            </Button>
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
          {/* <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Address:</h2>
            {address ? <p>{address}</p> : <p>Fetching address...</p>}
          </div> */}
        </div>
      </div>
      <Footer />
    </>
  );
}
