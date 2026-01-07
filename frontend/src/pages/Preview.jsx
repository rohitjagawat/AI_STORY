import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState("next");

  const API_URL = import.meta.env.VITE_API_URL;
  const backendBase = API_URL.replace("/api", "");

  const FREE_PAGES = 2;

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

        if (d.paid) {
          const res2 = await fetch(
            `${API_URL}/story/result/${result.bookId}`
          );
          const updated = await res2.json();

          setData((prev) => ({
            ...prev,
            story: updated.story,
            previewImage: updated.previewImage,
          }));

          if (poller) clearInterval(poller);
        }
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
        Opening your magical story…
      </div>
    );
  }

  const pages = data.story?.pages || [];
  const totalPages = data.story?.totalPages || pages.length;

  const text = pages[currentPage];
  const isFree = currentPage < FREE_PAGES;
  const isLocked = !isFree && !paid;

  const flipTo = (nextPage, dir) => {
    setDirection(dir);
    setIsFlipping(true);

    setTimeout(() => {
      setCurrentPage(nextPage);
      setIsFlipping(false);
    }, 650);
  };

  return (
    <div className="min-h-screen bg-brandBg px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brandPurple">
            Your Child’s Personalized Storybook 📘
          </h1>
          <p className="mt-1 text-sm text-brandMuted italic">
            A magical bedtime story crafted just for your child ✨
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="h-1 bg-yellow-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brandPurple transition-all duration-500"
            style={{
              width: `${((currentPage + 1) / totalPages) * 100}%`,
            }}
          />
        </div>

        {/* BOOK */}
        <div className="relative perspective-[1800px] h-[520px]">

          {/* NEXT PAGE UNDERLAY */}
          {isFlipping && currentPage + 1 < totalPages && (
            <div className="absolute inset-0 bg-[#fffaf0] rounded-[28px] border border-yellow-200 shadow-inner overflow-hidden">
              <img
                src={`${backendBase}/images/${data.bookId}/page_${currentPage + 2}.png`}
                className="w-full aspect-[16/9] object-cover opacity-90"
              />
            </div>
          )}

          {/* CURRENT PAGE */}
          <div
            className={`absolute inset-0 bg-[#fffaf0] rounded-[28px] border border-yellow-200
            shadow-[0_20px_60px_rgba(0,0,0,0.15)]
            overflow-hidden transform-gpu
            transition-transform duration-[650ms] ease-in-out
            ${
              isFlipping && direction === "next"
                ? "-rotate-y-180 origin-right"
                : "rotate-y-0 origin-right"
            }
            ${isLocked ? "pointer-events-none" : ""}`}
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* IMAGE */}
            <div className="relative">
              <img
                src={`${backendBase}/images/${data.bookId}/page_${currentPage + 1}.png`}
                onError={(e) =>
                  (e.currentTarget.src = `${backendBase}/${data.previewImage}`)
                }
                className={`w-full aspect-[16/9] object-cover ${
                  isLocked ? "blur-[14px]" : ""
                }`}
              />
              {isLocked && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              )}
            </div>

            {!isLocked && (
              <div className="p-8 text-center text-lg leading-relaxed text-gray-800 font-medium">
                {text || ""}
              </div>
            )}
          </div>

          {/* LOCK OVERLAY */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/95 rounded-3xl shadow-2xl p-8 text-center max-w-sm">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="font-semibold text-xl mb-2">
                  The story continues…
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Unlock the remaining pages to discover how this magical
                  journey ends — written specially for your child.
                </p>

                <button
                  onClick={() => {
                    const url =
                      `https://www.jrbillionaire.com/cart/add` +
                      `?id=50467255124254` +
                      `&quantity=1` +
                      `&properties[bookId]=${data.bookId}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="px-8 py-3 rounded-full bg-brandPurple text-white font-semibold shadow-lg"
                >
                  ✨pay ₹999 and Unlock the Complete Storybook
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  One-time payment • Lifetime access • Printable PDF
                </p>
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-between items-center pt-4">
          <button
            disabled={currentPage === 0 || isFlipping}
            onClick={() => flipTo(currentPage - 1, "prev")}
            className={`px-6 py-3 rounded-full font-semibold ${
              currentPage === 0
                ? "bg-gray-200 text-gray-400"
                : "bg-brandPurple text-white"
            }`}
          >
            ⬅ Previous
          </button>

          <button
            disabled={currentPage === totalPages - 1 || isFlipping}
            onClick={() => flipTo(currentPage + 1, "next")}
            className={`px-6 py-3 rounded-full font-semibold ${
              currentPage === totalPages - 1
                ? "bg-gray-200 text-gray-400"
                : "bg-brandPurple text-white"
            }`}
          >
            Next ➡
          </button>
        </div>

        {/* AFTER PAYMENT */}
        {paid && (
          <div className="text-center pt-6">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
              ✅ Payment successful! All pages unlocked.
            </div>

            <button
              onClick={() =>
                window.open(`${API_URL}/view/${data.bookId}`, "_blank")
              }
              className="px-8 py-3 rounded-full bg-green-600 text-white font-semibold shadow-lg"
            >
              📘 View / Download Storybook PDF
            </button>
          </div>
        )}

        {/* CREATE ANOTHER */}
        <div className="flex justify-center pt-10">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/create");
            }}
            className="px-8 py-4 rounded-full border-2 border-brandPurple text-brandPurple font-semibold hover:bg-brandPurple hover:text-white transition"
          >
            ✨ Create Another Magical Story
          </button>
        </div>

      </div>
    </div>
  );
}
