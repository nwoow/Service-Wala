import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Maria Kate",
    image:
      "https://img.freepik.com/free-photo/medium-shot-smiley-man-posing_23-2149915892.jpg?t=st=1716364756~exp=1716368356~hmac=6861a2a425d375a48ca9f795b11f41a4f960f25bad703b6898d9b2959c3d23ca&w=360",
    testimonial:
      "In ac turpis justo. Vivamus auctor quam vitae odio feugiat pulvinar. Sed semper ligula sed lorem tincidunt dignissim. Nam sed cursus lectus. Proin non rutrum magna. Proin gravida.",
  },
  {
    name: "John Doe",
    image: "https://img.freepik.com/free-photo/beautiful-male-half-length-portrait-isolated-white-studio-background-young-emotional-hindu-man-blue-shirt-facial-expression-human-emotions-advertising-concept-standing-smiling_155003-25250.jpg?t=st=1716364719~exp=1716368319~hmac=546ca7bf121267955fa0beaa40b7945c65ddc621f33d8bbe5734070783a628cf&w=996",
    testimonial:
      "Maecenas auctor, quam eget tincidunt pretium, felis diam semper turpis, sed scelerisque diam libero facilisis libero. Quisque vitae semper metus. Aliquam eu dui aliquam, faucibus metus quis, elementum nunc.",
  },
  {
    name: "Anna Deynah",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    testimonial:
      "Duis sagittis, turpis in ullamcorper venenatis, ligula nibh porta dui, sit amet rutrum enim massa in ante. Curabitur in justo at lorem laoreet ultricies. Nunc ligula felis, sagittis eget nisi vitae ex arcu sit amet erat.",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  const prevSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  return (
    <div className="container my-12 mx-auto md:px-6">
      <section className="text-center">
        <div className="relative bg-white h-96  flex justify-center items-center rounded-xl shadow-lg overflow-hidden">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col justify-center items-center transition-all duration-1000 ease-in-out ${
                index === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ transitionProperty: "opacity, transform" }}
            >
              <img
                className="mx-auto mb-6 rounded-full shadow-lg dark:shadow-black/20 w-28 h-28 object-cover"
                src={testimonial.image}
                alt="avatar"
              />
              <div className="flex flex-wrap justify-center">
                <div className="w-full shrink-0 grow-0 basis-auto px-3 lg:w-8/12">
                  <h5 className="mb-2 text-4xl font-bold font-cookie text-blue-500">
                    {testimonial.name}
                  </h5>
                  <p className="mb-6 text-gray-600 text-justify">
                    {testimonial.testimonial}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <button
            className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-3 opacity-50 hover:opacity-75 hover:scale-110 transition-all duration-700"
            type="button"
            onClick={prevSlide}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              className="w-6 h-6"
            >
              <path
                fill="currentColor"
                d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
              />
            </svg>
          </button>
          <button
            className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-3 opacity-50 hover:opacity-75 hover:scale-110 transition-all duration-700"
            type="button"
            onClick={nextSlide}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              className="w-6 h-6"
            >
              <path
                fill="currentColor"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;
