"use client";

import Link from "next/link";
import {
  IoIosStar,
  IoIosStarHalf,
  IoIosStarOutline,
  IoMdOpen,
} from "react-icons/io";
import { useEffect, useState } from "react";

const ServiceShow = ({ service }) => {


  const [ratingArray, setRatingArray] = useState([]);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    setRatingArray((prev) => {
      return prev.concat(service?.reviews?.map((review) => review.rating));
    });
  }, [service]);
  useEffect(() => {
    const countRatings = ratingArray.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    const {
      1: r1 = 0,
      2: r2 = 0,
      3: r3 = 0,
      4: r4 = 0,
      5: r5 = 0,
    } = countRatings;

    const result =
      (5 * r5 + 4 * r4 + 3 * r3 + 2 * r2 + 1 * r1) / (r5 + r4 + r3 + r2 + r1);
    if (isNaN(result)) {
      setRating(0);
    } else {
      setRating(result.toFixed(1));
    }
  }, [ratingArray]);

  return (
    <div className="max-w-sm mx-auto bg-white p-6 mb-4 shadow-md rounded-lg overflow-hidden h-96 flex flex-col justify-between">
      <div>
        <div className="flex items-center mb-4">
          <img
            src={service.icon?.url}
            alt={service.name}
            className="w-16 h-16 rounded mr-4 object-cover drop-shadow-lg"
          />
          <div class="flex flex-col justify-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {service.name}
            </h2>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: 5 }, (e, index) => {
                    let stars = isNaN(rating) ? 0 : rating;
                    return (
                      <span key={index} className="text-[#FFB800]">
                        {stars >= index + 1 ? (
                          <IoIosStar size={15} />
                        ) : stars >= index + 0.5 ? (
                          <IoIosStarHalf size={15} />
                        ) : (
                          <IoIosStarOutline size={15} />
                        )}
                      </span>
                    );
                  })}
                </div>
                <span className="ml-1">{rating}</span>
              </div>
              <span className="ml-2 text-gray-700">
                | {service?.reviews?.length} reviews
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex gap-2 items-center my-2">
            <div className="whitespace-nowrap text-sm">{service.name}</div>
            <div className="h-px bg-gray-300 w-full"></div>
          </div>
          <div className="flex flex-col   max-h-44 overflow-auto no-scrollbar gap-4">
            {service.subServices?.map((sub, i) => {
              return (
                <div
                  key={i}
                  className="flex items-center gap-4   bg-gray-100 p-3 rounded-md"
                >
                  <img
                    src={sub.icon?.url}
                    alt={sub.name}
                    className="w-16 h-16 rounded mr-4 drop-shadow-lg object-cover"
                  />
                  <span className="text-gray-800 font-medium">{sub.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Link href={`/services/${service._id}`}>
        <button className="flex items-center gap-1 justify-center w-full text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
          View
          <IoMdOpen />
        </button>
      </Link>
    </div>
  );
};



export default ServiceShow;
