import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const backendBase = API_URL.replace("/api", "");

  useEffect(() => {
    // 🔒 ONLY use storyResult coming from Generating page
    const result = JSON.parse(localStorage.getItem("storyResult"));

    if (!result || !result.bookId) {
      navigate("/create");
      return;
    }

    setData(result);

    // 🔍 Check payment status ONLY ONCE
    fetch(`${API_URL}/payment/has-paid?bookId=${result.bookId}`)
      .then((res) => res.json())
      .then((d) => setPaid(d.paid))
      .catch(() => setPaid(false));
  }, [API_URL, navigate]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No preview available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brandBg flex items-center justify-center px-4 py-10">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-6 text-center">

        <h1 className="text-2xl font-bold text-brandPurple mb-4">
          Your Storybook Preview 📘
        </h1>

        {data.previewImage && (
          <img
            src={`${backendBase}/${data.previewImage}`}
            alt="Preview"
            className="w-full rounded-xl mb-6"
          />
        )}

        {paid === null && (
          <div className="text-sm text-gray-500 mb-6">
            Checking payment status…
          </div>
        )}

        {/* 🔒 NOT PAID */}
        {paid === false && (
          <>
            <div className="mb-6 p-4 rounded-xl bg-brandPurple/10 text-sm">
              🔒 Full storybook is locked.
            </div>

            <button
              onClick={() => {
                const url =
                  `https://www.jrbillionaire.com/cart/add` +
                  `?id=50467255124254` +
                  `&quantity=1` +
                  `&properties[bookId]=${data.bookId}`;

                // 🔥 OPEN PAYMENT IN NEW TAB
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              className="w-full mb-6 px-6 py-3 rounded-full bg-brandPurple text-white font-semibold"
            >
              🔐 Pay ₹999 to Unlock your Storybook
            </button>
          </>
        )}

        {/* ✅ PAID */}
        {paid === true && (
          <>
            <div className="mb-6 p-4 rounded-xl bg-green-100 text-green-800 text-sm font-medium">
              ✅ Payment successful!
            </div>

            <button
              onClick={() =>
                window.open(
                  `${API_URL}/view/${data.bookId}`,
                  "_blank"
                )
              }
              className="w-full mb-4 px-6 py-3 rounded-full bg-green-600 text-white font-semibold"
            >
              👀 View Your Story Book
            </button>
          </>
        )}

        <button
          onClick={() => {
            // 🧹 CLEAN BEFORE NEW STORY
            localStorage.removeItem("storyPayload");
            localStorage.removeItem("storyResult");
            localStorage.removeItem("paidBookId");
            navigate("/create");
          }}
          className="text-brandPurple underline"
        >
          ➕ Create Another Story
        </button>
      </div>
    </div>
  );
}
