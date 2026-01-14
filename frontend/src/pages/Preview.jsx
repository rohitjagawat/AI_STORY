import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";

export default function Preview() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(false);
  const [showHint, setShowHint] = useState(
    !localStorage.getItem("flip_hint_seen")
  );

  // 🔥 NEW: auto refresh key (PAID users)
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});


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


  // 🔁 RESET image loaded state when new preview opens
useEffect(() => {
  if (data?.bookId) {
    setLoadedImages({});
  }
}, [data?.bookId]);


  /* ===============================
     🔄 AUTO REFRESH IMAGES (PAID)
  ================================ */
  useEffect(() => {
  if (!paid || !data?.story) return;

  const total = data.story.pages.length;
  const loadedCount = Object.keys(loadedImages).length;

  if (loadedCount >= total) return; // ✅ all images loaded

  const interval = setInterval(() => {
    setRefreshKey((k) => k + 1);
  }, 4000);

  return () => clearInterval(interval);
}, [paid, loadedImages, data]);



  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Opening your magical story…
      </div>
    );
  }

  const pages = data.story?.pages || [];
  const totalPages = data.story?.totalPages || pages.length;
  const childName = data?.input?.name || "";

  return (
    <div className="min-h-screen bg-brandBg px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brandPurple">
            Your Child’s Personalized Storybook 📘
          </h1>
          <p className="mt-1 text-sm text-brandMuted italic">
            A magical bedtime story crafted just for your child ✨
          </p>
        </div>

        {/* BOOK */}
        <div className="flex justify-center relative">
          <HTMLFlipBook
            width={380}
            height={560}
            size="stretch"
            minWidth={320}
            maxWidth={440}
            minHeight={500}
            maxHeight={600}
            maxShadowOpacity={0.5}
            showCover={false}
            mobileScrollSupport={true}
            className="shadow-2xl"
            onFlip={() => {
              if (showHint) {
                setShowHint(false);
                localStorage.setItem("flip_hint_seen", "true");
              }
            }}
          >
            {/* DUMMY PAGE */}
            <div className="bg-transparent"></div>

            {/* ================= COVER PAGE ================= */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <img
                src={`${backendBase}/images/${data.bookId}/page_01.png`}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />

              <div className="relative z-10 flex flex-col justify-center items-center h-full px-6 text-center">
                <div className="backdrop-blur-md bg-white/15 border border-white/30
                    rounded-2xl px-6 py-6 shadow-2xl max-w-sm">
                  <h1 className="text-2xl font-bold text-white">
                    {data.title}
                  </h1>

                  <p className="mt-3 text-sm text-white/80 italic">
                    A story for {childName}
                  </p>
                </div>

                <p className="absolute bottom-6 text-xs text-white/70">
                  Created by Jr. Billionaire
                </p>
              </div>
            </div>

            {/* ================= STORY PAGES ================= */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const text = pages[index];
              const isFree = index < FREE_PAGES;
              const isLocked = !isFree && !paid;

              return (
                <div
                  key={index}
                  className="relative bg-[#fffaf0] border border-yellow-200 rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="pt-4 text-center text-sm font-medium text-gray-500">
                    {childName}’s Story
                  </div>

                  {/* IMAGE WITH SKELETON */}
                  <div className="px-4 pt-3">
                    {(() => {
                      const pageNumber = String(index + 1).padStart(2, "0");
                      const isLoaded = loadedImages[pageNumber];

                      return (
                        <div className="relative w-full h-[300px]">
                          {!isLoaded && (
                            <div className="absolute inset-0 rounded-lg bg-gray-300 animate-pulse" />
                          )}

                          <img
                            src={`${backendBase}/images/${data.bookId}/page_${pageNumber}.png${!isLoaded ? `?rev=${refreshKey}` : ""}`}

                            onLoad={() =>
                              setLoadedImages((prev) => ({
                                ...prev,
                                [pageNumber]: true,
                              }))
                            }
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                `${backendBase}/images/${data.bookId}/page_01.png`;
                            }}
                            className={`w-full h-[300px] object-cover rounded-lg transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"
                              } ${isLocked ? "blur-[14px]" : ""}`}
                          />
                        </div>
                      );
                    })()}

                  </div>

                  {/* TEXT */}
                  {!isLocked && (
                    <div className="px-6 pt-6 pb-10 text-center text-base leading-relaxed text-gray-800 font-medium flex-1">
                      {text}
                    </div>
                  )}

                  {/* PAGE NUMBER */}
                  <div className="pb-4 text-center text-xs text-gray-400">
                    {index + 1}
                  </div>

                  {/* LOCK */}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/95 rounded-2xl shadow-xl p-6 text-center max-w-xs">
                        <div className="text-3xl mb-3">🔒</div>
                        <p className="text-sm text-gray-600 mb-4">
                          Unlock the full storybook to continue your magical journey✨
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
                          Pay ₹999 to Unlock full Storybook
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
              <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full text-sm font-medium">
                ✅ Payment successful! Your full storybook is unlocked.
              </div>

              <button
                onClick={() =>
                  window.open(`${API_URL}/view/${data.bookId}`, "_blank")
                }
                className="px-10 py-4 rounded-full bg-green-600 text-white font-semibold text-lg shadow-lg"
              >
                📘 View & Download Storybook PDF
              </button>
            </div>
          )}

          {/* CREATE ANOTHER */}
          <div className="pt-16 flex justify-center">
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/create");
              }}
              className="px-10 py-4 rounded-full border-2 border-brandPurple text-brandPurple font-semibold hover:bg-brandPurple hover:text-white transition"
            >
              ✨ Create Another Magical Story
            </button>
          </div>

        
      </div>
    </div>
  );
}
