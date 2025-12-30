import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  console.log("🔥 PREVIEW NEW VERSION LOADED");
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

    const bookId = `${payload.name}_${payload.age}_${payload.interest}`.toLowerCase();
    const email = payload.email || "guest@example.com";

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/story/result/${bookId}`);
        const result = await res.json();

        if (result.ready) {
          setData({ ...result, bookId, email });
          setStatus("ready");
          clearInterval(interval);

          // 🔐 check payment
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

  /* ---------- ERROR ---------- */
  if (status === "error") {
    return <div className="text-center mt-10">No story found</div>;
  }

  /* ---------- LOADING ---------- */
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brandBg px-4">
        <div className="bg-white max-w-sm w-full rounded-3xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-brandPurple mb-2">
            Creating Your Magical Story ✨
          </h2>
          <p className="text-sm text-gray-500">
            Please wait while we generate your storybook…
          </p>
        </div>
      </div>
    );
  }

  /* ---------- READY ---------- */
  return (
    <div className="min-h-screen bg-brandBg flex items-center justify-center px-4 py-10">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-6 text-center">

        <h1 className="text-2xl font-bold text-brandPurple mb-4">
          Your Storybook Preview 📘
        </h1>

        {/* FREE PREVIEW IMAGE */}
        {data.previewImage && (
          <img
            src={`${backendBase}/${data.previewImage}`}
            alt="Story preview"
            className="w-full rounded-xl shadow-lg mb-6"
          />
        )}

        {/* 🔒 LOCKED STATE */}
        {!paid && (
          <>
            <div className="mb-6 p-4 rounded-xl bg-brandPurple/10 text-brandText text-sm">
              🔒 Full storybook (PDF) is locked.  
              <br />
              Complete payment to unlock and download.
            </div>

            <button
              onClick={() => {
                localStorage.setItem("paymentBookId", data.bookId);
                localStorage.setItem("paymentEmail", data.email);

                window.location.href =
                  "https://www.jrbillionaire.com/products/magic-storybook-personalized-pdf";
              }}
              className="block w-full mb-6 px-6 py-3 rounded-full bg-brandPurple text-white font-semibold shadow-md hover:scale-105 transition"
            >
              🔐 Pay & Download Full Storybook
            </button>
          </>
        )}

        {/* ✅ UNLOCKED STATE */}
        {paid && (
          <>
            <div className="mb-6 p-4 rounded-xl bg-green-100 text-green-800 text-sm font-medium">
              ✅ Payment successful! Your storybook is ready 🎉
            </div>

            <button
              onClick={() =>
                window.location.href =
                  `${API_URL}/download/${data.bookId}?email=${data.email}`
              }
              className="block w-full mb-4 px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow-md hover:scale-105 transition"
            >
              ⬇️ Download PDF
            </button>
          </>
        )}

        {/* CREATE ANOTHER */}
        <button
          onClick={() => navigate("/create")}
          className="text-brandPurple font-medium underline hover:opacity-80"
        >
          ➕ Create Another Story
        </button>

      </div>
    </div>
  );
}
