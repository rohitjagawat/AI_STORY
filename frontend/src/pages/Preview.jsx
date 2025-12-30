import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const backendBase = API_URL.replace("/api", "");

  useEffect(() => {
    // ✅ result saved by Generating page
    const result = JSON.parse(localStorage.getItem("storyResult"));
    const payload = JSON.parse(localStorage.getItem("storyPayload"));

    if (!result || !payload) return;

    const email =
      localStorage.getItem("paidEmail") ||
      payload.email ||
      "guest@example.com";

    const bookId =
      localStorage.getItem("paidBookId") ||
      `${payload.name}_${payload.age}_${payload.interest}`.toLowerCase();

    setData({
      ...result,
      bookId,
      email,
    });

    // 🔐 CHECK PAYMENT ONCE (NO LOOP)
    fetch(`${API_URL}/payment/has-paid?email=${email}`)
      .then((res) => res.json())
      .then((d) => setPaid(d.paid));
  }, []);

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

        {data.previewImage ? (
          <img
            src={`${backendBase}/${data.previewImage}`}
            alt="Preview"
            className="w-full rounded-xl mb-6"
          />
        ) : (
          <div className="mb-6 text-sm text-gray-500">
            Preparing preview image…
          </div>
        )}


        {/* 🔒 NOT PAID */}
        {!paid && (
          <>
            <div className="mb-6 p-4 rounded-xl bg-brandPurple/10 text-sm">
              🔒 Full storybook is locked. Pay once to unlock.
            </div>

            <button
              onClick={() => {
                localStorage.setItem("paidEmail", data.email);
                localStorage.setItem("paidBookId", data.bookId);

                window.location.href =
                  "https://www.jrbillionaire.com/products/magic-storybook-personalized-pdf";
              }}
              className="w-full mb-6 px-6 py-3 rounded-full bg-brandPurple text-white font-semibold"
            >
              🔐 Pay & Download
            </button>
          </>
        )}

        {/* ✅ PAID */}
        {paid && (
          <>
            <div className="mb-6 p-4 rounded-xl bg-green-100 text-green-800 text-sm font-medium">
              ✅ Payment successful! Download your story 🎉
            </div>

            <button
              onClick={() =>
                window.location.href =
                `${API_URL}/download/${data.bookId}?email=${data.email}`
              }
              className="w-full mb-4 px-6 py-3 rounded-full bg-green-600 text-white font-semibold"
            >
              ⬇️ Download PDF
            </button>
          </>
        )}

        <button
          onClick={() => navigate("/create")}
          className="text-brandPurple underline"
        >
          ➕ Create Another Story
        </button>
      </div>
    </div>
  );
}
