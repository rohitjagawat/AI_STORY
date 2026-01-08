import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";

export default function Preview() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const backendBase = API_URL.replace("/api", "");

  const FREE_PAGES = 2;

  /* ===============================
     LOAD STORY + POLL PAYMENT
  ================================ */
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

  return (
    <div className="min-h-screen bg-brandBg px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brandPurple">
            Your Child’s Personalized Storybook 📘
          </h1>
          <p className="mt-1 text-sm text-brandMuted italic">
            A magical bedtime story crafted just for your child ✨
          </p>
        </div>

        {/* BOOK VIEWER */}
        <div className="flex justify-center">
          <HTMLFlipBook
            width={360}
            height={520}
            size="stretch"
            minWidth={300}
            maxWidth={420}
            minHeight={460}
            maxHeight={580}
            maxShadowOpacity={0.45}
            showCover={false}
            mobileScrollSupport={true}
            className="shadow-2xl"
          >
            {Array.from({ length: totalPages }).map((_, index) => {
              const text = pages[index];
              const isFree = index < FREE_PAGES;
              const isLocked = !isFree && !paid;

              return (
                <div
                  key={index}
                  className="relative bg-[#fffaf0] border border-yellow-200 rounded-lg overflow-hidden"
                >
                  {/* IMAGE */}
                  <div className="relative">
                    <img
                      src={`${backendBase}/images/${data.bookId}/page_${index + 1}.png`}
                      loading="lazy"
                      onError={(e) =>
                        (e.currentTarget.src = `${backendBase}/${data.previewImage}`)
                      }
                      className={`w-full h-[300px] object-contain ${
                        isLocked ? "blur-[14px]" : ""
                      }`}
                    />

                    {isLocked && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    )}
                  </div>

                  {/* TEXT */}
                  {!isLocked && (
                    <div className="p-5 text-center text-base leading-relaxed text-gray-800 font-medium">
                      {text}
                    </div>
                  )}

                  {/* LOCK CTA */}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/95 rounded-2xl shadow-xl p-6 text-center max-w-xs">
                        <div className="text-3xl mb-3">🔒</div>
                        <h3 className="font-semibold mb-2">
                          This page is locked
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Unlock the full storybook to continue
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
                          className="px-6 py-2 rounded-full bg-brandPurple text-white font-semibold"
                        >
                          Unlock Full Book
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </HTMLFlipBook>
        </div>

        {/* AFTER PAYMENT */}
        {paid && (
          <div className="pt-10 flex flex-col items-center gap-6">
            <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full text-sm font-medium shadow-sm">
              ✅ Payment successful! Your full storybook is unlocked.
            </div>

            <button
              onClick={() =>
                window.open(`${API_URL}/view/${data.bookId}`, "_blank")
              }
              className="px-10 py-4 rounded-full bg-green-600 text-white font-semibold text-lg
                         shadow-lg hover:shadow-xl transition-all"
            >
              📘 View & Download Storybook PDF
            </button>

            <p className="text-xs text-gray-500">
              You can access this story anytime using this link
            </p>
          </div>
        )}

        {/* CREATE ANOTHER STORY */}
        <div className="pt-16 flex justify-center">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/create");
            }}
            className="group flex items-center gap-3 px-10 py-4 rounded-full
                       border-2 border-brandPurple text-brandPurple font-semibold
                       hover:bg-brandPurple hover:text-white transition-all
                       shadow-md hover:shadow-xl"
          >
            <span className="text-xl transition-transform group-hover:rotate-12">
              ✨
            </span>
            Create Another Magical Story
          </button>
        </div>

      </div>
    </div>
  );
}
