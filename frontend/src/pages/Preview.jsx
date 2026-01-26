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

  // 🔥 auto refresh key (PAID users)
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;
  const backendBase = API_URL.replace("/api", "");

  const FREE_PAGES = 2;

  // 🔍 CHECK IF IMAGE EXISTS (CACHE SAFE)
  const checkImageExists = async (url) => {
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      return res.ok;
    } catch {
      return false;
    }
  };

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

  // 🔁 RESET loaded images on new book
  useEffect(() => {
    if (data?.bookId) setLoadedImages({});
  }, [data?.bookId]);

  /* ===============================
     🔄 AUTO REFRESH (ONLY UNLOADED)
  ================================ */
  useEffect(() => {
    if (!paid || !data?.story) return;

    const total = data.story.pages.length;
    if (Object.keys(loadedImages).length >= total) return;

    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [paid, loadedImages, data]);

  /* ===============================
     ✅ AUTO MARK READY IMAGES
  ================================ */
  useEffect(() => {
    if (!paid || !data?.story) return;

    data.story.pages.forEach((_, index) => {
      const page = String(index + 1).padStart(2, "0");
      if (loadedImages[page]) return;

      const url = `${backendBase}/images/${data.bookId}/page_${page}.png`;
      checkImageExists(url).then((exists) => {
        if (exists) {
          setLoadedImages((prev) => ({ ...prev, [page]: true }));
        }
      });
    });
  }, [paid, data, refreshKey]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center font-medium">
        Opening your magical story…
      </div>
    );
  }

  const pages = data.story?.pages || [];
  const childName = data?.input?.name || "";

  return (
    <div className="min-h-screen bg-brandRed px-4 py-12">
      <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] px-8 py-12 shadow-[0_30px_80px_rgba(0,0,0,0.25)] space-y-10">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-black">
            Your Child’s Personalized Storybook 📘
          </h1>
          <p className="mt-1 text-sm text-gray-600 italic">
            A magical bedtime story crafted just for your child ✨
          </p>
        </div>

        {/* BOOK */}
        <div className="flex justify-center">
          <HTMLFlipBook
            width={420}
            height={640}
            minWidth={360}
            maxWidth={480}
            minHeight={600}
            maxHeight={700}
            showCover={false}
            mobileScrollSupport
            className="shadow-[0_25px_70px_rgba(0,0,0,0.35)]"
            onFlip={() => {
              if (showHint) {
                setShowHint(false);
                localStorage.setItem("flip_hint_seen", "true");
              }
            }}
          >
            <div />

            {/* COVER */}
            <div className="relative bg-black rounded-2xl overflow-hidden">
              <img
                src={`${backendBase}/images/${data.bookId}/page_01.png`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
                <h1 className="text-2xl font-bold text-white">{data.title}</h1>
                <p className="mt-2 text-sm text-white/80">
                  A story for {childName}
                </p>
              </div>
            </div>

            {/* STORY PAGES */}
            {pages.map((text, index) => {
              const page = String(index + 1).padStart(2, "0");
              const isFree = index < FREE_PAGES;
              const isLocked = !isFree && !paid;
              const isLoaded = loadedImages[page];

              const baseUrl = `${backendBase}/images/${data.bookId}/page_${page}.png`;
              const imageUrl = isLoaded
                ? baseUrl
                : `${baseUrl}?rev=${refreshKey}`;

              return (
                <div
                  key={index}
                  className="relative bg-[#fffaf0] border border-yellow-200 rounded-2xl flex flex-col"
                >
                  <p className="pt-4 text-center text-sm font-semibold text-brandRed">
                    {childName}’s Story
                  </p>

                  {/* IMAGE */}
                  <div className="px-4 pt-3">
                    <div className="relative w-full h-[300px]">
                      {!isLoaded && (
                        <div className="absolute inset-0 z-10 bg-red-50 flex flex-col items-center justify-center animate-pulse rounded-lg">
                          <div className="text-3xl mb-2">🎨✨</div>
                          <p className="text-sm font-semibold text-brandRed">
                            Creating illustration…
                          </p>
                          <p className="text-xs text-gray-500">
                            Generating your image…
                          </p>
                        </div>
                      )}

                      <img
                        src={imageUrl}
                        onLoad={() =>
                          setLoadedImages((p) => ({ ...p, [page]: true }))
                        }
                        className={`w-full h-full object-cover rounded-lg transition-opacity duration-700 ${
                          isLoaded ? "opacity-100" : "opacity-0"
                        } ${isLocked ? "blur-[14px]" : ""}`}
                        draggable={false}
                      />
                    </div>
                  </div>

                  {/* TEXT */}
                  {!isLocked && (
                    <div className="px-6 pt-5 pb-20 text-center flex-1">
                      {index === 9 && (
                        <h2 className="mb-4 text-xl font-extrabold text-black">
                          🌱 <span className="text-brandRed">Moral of the Story</span>
                        </h2>
                      )}
                      <p className="text-gray-800 font-medium leading-relaxed">
                        {text}
                      </p>
                    </div>
                  )}

                 <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400">
  {index + 1}
</div>


                  {/* LOCK */}
                  {isLocked && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl shadow-2xl p-6 text-center max-w-xs">
                        <div className="text-3xl mb-3">🔒</div>
                        <p className="text-sm text-gray-600 mb-4">
                          Unlock the full storybook to continue ✨
                        </p>
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.jrbillionaire.com/cart/add?id=50467255124254&quantity=1&properties[bookId]=${data.bookId}`,
                              "_blank"
                            )
                          }
                          className="px-6 py-3 rounded-full bg-brandRed text-white font-bold hover:bg-black transition"
                        >
                          Pay ₹99 to Unlock
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
  <div className="pt-12 flex flex-col items-center gap-6">
    <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full text-sm font-semibold shadow">
      ✅ Payment successful! Your full storybook is unlocked.
    </div>

    <button
      onClick={() =>
        window.open(`${API_URL}/view/${data.bookId}`, "_blank")
      }
      className="px-12 py-4 rounded-full bg-brandRed text-white font-extrabold text-lg shadow-lg hover:bg-black hover:scale-105 transition"
    >
      📘 View & Download Storybook PDF
    </button>
  </div>
)}


        {/* CREATE ANOTHER */}
        <div className="pt-12 flex justify-center">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/create");
            }}
            className="px-10 py-4 rounded-full border-2 border-brandRed text-brandRed font-bold hover:bg-brandRed hover:text-white transition"
          >
            ✨ Create Another Story
          </button>
        </div>
      </div>
    </div>
  );
}
