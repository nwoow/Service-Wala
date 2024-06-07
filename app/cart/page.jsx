"use client";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { Button, ButtonGroup } from "@material-tailwind/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { RiErrorWarningFill } from "react-icons/ri";
import { VscDebugContinue } from "react-icons/vsc";

const Cart = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (cart) {
      setProducts(cart);
    }
    console.log(cart);
  }, []);
  const [validationMessage, setValidationMessage] = useState("");

  const handleQuantityChange = (index, change) => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product, i) => {
        if (i === index) {
          const newQuantity = product.quantity + change;
          if (newQuantity < 1 || newQuantity > 10) {
            setValidationMessage("Quantity should be between 1 and 10.");
            return product;
          }
          setValidationMessage("");
          return {
            ...product,
            quantity: newQuantity,
          };
        }
        return product;
      });

      // Update localStorage with the updated products
      localStorage.setItem("cart", JSON.stringify(updatedProducts));

      return updatedProducts;
    });
  };

  const handleRemoveProduct = (index) => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.filter((_, i) => i !== index);

      // Update localStorage with the updated products
      localStorage.setItem("cart", JSON.stringify(updatedProducts));

      return updatedProducts;
    });
  };

  return (
    <div>
      <Head>
        <title>Shopping Cart</title>
      </Head>
      <Nav />
      <div className="flex flex-col lg:flex-row px-4 lg:px-10 h-full justify-between gap-6 lg:gap-10 my-6 lg:my-10 ">
        <div className="w-full lg:w-2/3 min-h-auto max-h-[78vh] overflow-auto bg-white pb-6 shadow-lg rounded-lg no-scrollbar">
          <div className="flex items-center justify-between gap-9 sticky px-6 py-4 top-0 bg-white z-10">
            <div
              className="flex items-center gap-1 cursor-pointer text-gray-700"
              onClick={() => router.back()}
            >
              <FaArrowLeftLong />
              <div>Cart</div>
            </div>
            {validationMessage && (
              <div className="text-red-500 flex items-center gap-1 transition-all duration-700">
                <RiErrorWarningFill />
                {validationMessage}
              </div>
            )}
          </div>
          <div className="mt-4 space-y-6 px-6 h-full">
            {products.length === 0 ? (
              <div className="flex flex-col gap-4 items-center h-full md:pt-24">
                <div className="text-2xl font-julius text-center">
                  🫠Uh oh, There is no Service in Your Cart
                </div>
                <div className="flex gap-4 items-center flex-col md:flex-row">
                  <div>Please Choose a Service First</div>
                  <Link href={"/services"}>
                    <Button
                      color="blue"
                      variant="gradient"
                      className="rounded whitespace-nowrap"
                    >
                      Choose a service
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              products.map((product, index) => (
                <div
                  key={index}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b pb-4"
                >
                  <div className="flex items-start lg:items-center">
                    <img
                      src={product.icon?.url}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="ml-4">
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-gray-500 text-sm">
                        ₹{parseFloat(product.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full lg:w-max flex-col lg:flex-row gap-4 mt-4 lg:mt-0">
                    <ButtonGroup
                      variant="gradient"
                      color="light-blue"
                      size="sm"
                    >
                      <Button onClick={() => handleQuantityChange(index, -1)}>
                        -
                      </Button>
                      <div className="px-4 flex items-center">
                        {product.quantity}
                      </div>
                      <Button onClick={() => handleQuantityChange(index, 1)}>
                        +
                      </Button>
                    </ButtonGroup>
                  </div>
                  <div className="font-semibold mt-4 lg:mt-0">
                    ₹{(product.price * product.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleRemoveProduct(index)}
                    className="bg-[#FA7070] hover:bg-[#FD5D5D] shadow-lg shadow-[#ffb6b69a] text-white px-4 py-2 rounded-md flex items-center justify-center gap-1 transition-all mt-4 lg:mt-0"
                    title="Remove Service"
                  >
                    Remove service
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="w-full lg:w-1/3 h-full bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold border-b pb-4">Summary</h2>
          <div className="mt-4 space-y-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                ₹
                {products
                  .reduce(
                    (acc, product) => acc + product.price * product.quantity,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Convenience Fee</span>
              <span>₹18.00</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>
                ₹
                {(
                  products.reduce(
                    (acc, product) => acc + product.price * product.quantity,
                    0
                  ) + 18
                ).toFixed(2)}
              </span>
            </div>
            {products.length === 0 ? (
              <button
                disabled
                className="w-full py-3 mt-3 flex items-center gap-1 justify-center bg-gray-500 text-white rounded-lg cursor-not-allowed"
              >
                Continue <VscDebugContinue />
              </button>
            ) : (
              <Link
                href="/checkout"
                className="w-full py-3 mt-3 flex items-center gap-1 hover:gap-2 justify-center hover:bg-gray-800 transition-all text-white rounded-lg bg-gray-700"
              >
                Continue <VscDebugContinue />
              </Link>
            )}
            <div className="text-sm text-gray-500">
              <p className="text-base">About Service Providers</p>
              <p>
                Our service providers are highly qualified and designed to
                provide customers with a variety of services.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p>NEED HELP?</p>
              <p>Contact our support team for assistance.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
