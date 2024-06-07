"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IoIosStar,
  IoIosStarHalf,
  IoIosStarOutline,
  IoMdOpen,
} from "react-icons/io";

const Service = ({ iconSrc, title, services, link, reviews }) => {
  const [ratingArray, setRatingArray] = useState([]);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    setRatingArray((prev) => {
      return prev.concat(reviews?.map((review) => review.rating));
    });
  }, [reviews]);
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
    <div className="flex flex-col gap-4 justify-between bg-white p-6 w-full rounded-lg shadow-lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <img
            src={iconSrc}
            alt="Icon"
            className="h-20 w-20 mr-3 rounded-md drop-shadow-lg object-cover"
          />
          <div class="flex flex-col justify-center">
            <h1 className="text-xl text-gray-700 font-bold">{title}</h1>
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
                | {reviews?.length} reviews
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="whitespace-nowrap text-sm">{title}</div>
          <div className="h-px bg-gray-300 w-full"></div>
        </div>
        <div className="flex flex-col   max-h-44 overflow-auto no-scrollbar gap-4">
          {services.length === 0 ? (
            <div className="text-center my-4">
              🫠Uh oh, There is no services in {title}
            </div>
          ) : (
            services.map((service, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-gray-100 p-3 rounded-md "
              >
                <img
                  src={service.icon?.url}
                  alt={service.name}
                  className="w-20 h-20 rounded-lg mr-4"
                />
                <span className="text-lg ">{service.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <Link href={`/services/${link}`} legacyBehavior>
        <a className="text-center flex justify-center items-center gap-2 bg-gray-700 text-white py-2 rounded-md">
          View{" "}
          <span aria-hidden="true">
            <IoMdOpen />
          </span>
        </a>
      </Link>
    </div>
  );
};

export default Service;
