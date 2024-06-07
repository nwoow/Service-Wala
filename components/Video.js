import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const VideoCarousel = () => {
    const videos = [
        "/Video/video1.mp4",
        "/Video/video2.mp4",
        "/Video/video3.mp4",
        "/Video/video4.mp4",
        "/Video/video5.mp4",
        "/Video/video6.mp4"
    ];

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const chunkArray = (array, chunkSize) => {
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
        }
        return result;
    };

    const videoChunks = chunkArray(videos, isMobile ? 1 : 3);

    const renderArrowPrev = (onClickHandler, hasPrev, label) =>
        hasPrev && (
            <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-800 text-white rounded-full p-2 z-10 focus:outline-none"
            >
                <MdChevronLeft className="w-6 h-6" />
            </button>
        );

    const renderArrowNext = (onClickHandler, hasNext, label) =>
        hasNext && (
            <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-800 text-white rounded-full p-2 z-10 focus:outline-none"
            >
                <MdChevronRight className="w-6 h-6" />
            </button>
        );

    return (
        <div className="carousel-container relative">
            <Carousel
                showThumbs={false}
                showStatus={false}
                infiniteLoop
                useKeyboardArrows
                autoPlay
                interval={8000}
                transitionTime={500}
                renderArrowPrev={renderArrowPrev}
                renderArrowNext={renderArrowNext}
            >
                {videoChunks.map((chunk, index) => (
                    <div key={index} className="video-group flex justify-center gap-4">
                        {chunk.map((video, idx) => (
                            <div key={idx} className="video-wrapper flex-1">
                                <video loop muted autoPlay className="video shadow-lg border rounded-lg">
                                    <source src={video} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ))}
                    </div>
                ))}
            </Carousel>
            <style jsx>{`
                .carousel-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    position: relative; /* Ensure the container is the reference for absolute positioning */
                }
                .video {
                    width: 100%;
                    height: auto;
                    border-radius: 10px;
                }
                @media (max-width: 768px) {
                    .video-group {
                        flex-direction: column;
                    }
                    .video-wrapper {
                        margin: 0;
                    }
                }
                /* Additional styles to ensure arrows are placed correctly */
                .carousel-container :global(.carousel .control-arrow) {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                }
                .carousel-container :global(.carousel .control-prev) {
                    left: -50px; /* Adjust this value based on your layout */
                }
                .carousel-container :global(.carousel .control-next) {
                    right: -50px; /* Adjust this value based on your layout */
                }
            `}</style>
        </div>
    );
};

export default VideoCarousel;
