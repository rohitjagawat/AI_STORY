import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const backendBase = API_URL.replace("/api", "");

  const FREE_PAGES = 2; // 👈 first 2 pages free

  useEffect(() => {
    const result = JSON.parse(localStorage.getItem("storyResult"));

    if (!result || !result.bookId) {
      navigate("/create");
      return;
    }

    setData(result);

    let poller;

    const checkPayment = async () => {
      try {
        const res = await fetch(
          `${API_URL}/payment/has-paid?bookId=${result.bookId}`
        );
        const d = await res.json();
        setPaid(d.paid);

        if (d.paid && poller) clearInterval(poller);
      } catch {
        setPaid(false);
      }
    };

    checkPayment();
    poller = setInterval(checkPayment, 3000);

    return () => poller && clearInterval(poller);
  }, [API_URL, navigate]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading preview...
      </div>
    );
  }

  const pages = data.story?.pages || [];

  return (
    <div className="min-h-screen bg-brandBg px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brandPurple mb-2">
            Your Illustrated Storybook 📘
          </h1>
          {!paid && (
            <p className="text-sm text-brandMuted">
              Preview mode — unlock to read the full magical story
            </p>
          )}
        </div>

        {/* STORY PAGES */}
        {pages.map((text, index) => {
          const isFree = index < FREE_PAGES;
          const isLocked = !isFree && !paid;

          return (
            <div key={index} className="relative">

              {/* PAGE LABEL */}
              <div className="mb-2 text-center text-sm font-medium text-brandMuted">
                Page {index + 1} of {pages.length}
                {isLocked && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-900 rounded text-xs">
                    LOCKED
                  </span>
                )}
              </div>

              {/* PAGE CARD */}
              <div
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition ${
                  isLocked ? "pointer-events-none" : ""
                }`}
              >
                {/* IMAGE */}
                {data.previewImage && (
                  <div className="relative">
                    <img
                      src={`${backendBase}/${data.previewImage}`}
                      alt="Story illustration"
                      className={`w-full aspect-[16/9] object-cover transition-all duration-300 ${
                        isLocked ? "blur-[14px] scale-105" : ""
                      }`}
                    />

                    {/* DARK OVERLAY ON LOCKED IMAGE */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                    )}
                  </div>
                )}

                {/* TEXT */}
                <div className="p-6 bg-yellow-50 text-center text-lg font-medium text-gray-800">
                  {text}
                </div>
              </div>

              {/* LOCK OVERLAY */}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 rounded-2xl shadow-xl p-6 text-center max-w-sm">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="font-semibold text-lg mb-2">
                      This page is locked
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Unlock the full storybook to continue this magical journey
                    </p>

                    {!paid && (
                      <button
                        onClick={() => {
                          const url =
                            `https://www.jrbillionaire.com/cart/add` +
                            `?id=50467255124254` +
                            `&quantity=1` +
                            `&properties[bookId]=${data.bookId}`;

                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                        className="px-6 py-3 rounded-full bg-brandPurple text-white font-semibold"
                      >
                        ✨ Pay ₹999 to Unlock Full Story
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* AFTER PAYMENT CTA */}
        {paid && (
          <div className="text-center pt-8">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
              ✅ Payment successful! All pages unlocked.
            </div>

            <button
              onClick={() =>
                window.open(`${API_URL}/view/${data.bookId}`, "_blank")
              }
              className="block mx-auto px-8 py-3 rounded-full bg-green-600 text-white font-semibold"
            >
              📘 View Full Storybook PDF
            </button>
          </div>
        )}

        {/* CREATE ANOTHER */}
        <div className="text-center pt-10">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/create");
            }}
            className="text-brandPurple underline"
          >
            ➕ Create Another Story
          </button>
        </div>
      </div>
    </div>
  );
}
