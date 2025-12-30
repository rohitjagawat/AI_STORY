import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const backendBase = API_URL.replace("/api", "");

  useEffect(() => {
    const payload = JSON.parse(localStorage.getItem("storyPayload"));

    if (!payload) {
      setStatus("error");
      return;
    }

    // ✅ ALWAYS read from localStorage first
    const email =
      localStorage.getItem("paidEmail") ||
      payload.email ||
      "guest@example.com";

    const bookId =
      localStorage.getItem("paidBookId") ||
      `${payload.name}_${payload.age}_${payload.interest}`.toLowerCase();

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/story/result/${bookId}`);
        const result = await res.json();

        if (result.ready) {
          setData({ ...result, bookId, email });
          setStatus("ready");
          clearInterval(interval);

          // 🔐 CHECK PAYMENT
          const payRes = await fetch(
            `${API_URL}/payment/has-paid?email=${email}`
          );
          const payData = await payRes.json();
          setPaid(payData.paid);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (status === "error") {
    return <div className="text-center mt-10">No story found</div>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your story…
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

        {/* 🔒 NOT PAID */}
        {!paid && (
          <>
            <div className="mb-6 p-4 rounded-xl bg-brandPurple/10 text-sm">
              🔒 Full storybook is locked. Pay once to unlock.
            </div>

            <button
              onClick={() => {
                // ✅ SAVE IDENTITY BEFORE PAYMENT
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
