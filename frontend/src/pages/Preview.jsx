import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";

export default function Preview() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(false);

  // flip hint – first time only
  const [showHint, setShowHint] = useState(
    !localStorage.getItem("flip_hint_seen")
  );

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
  const storyPagesCount = data.story?.totalPages || pages.length;
  const totalPages = storyPagesCount + 1; // +1 for cover
  const childName = data?.name || "Your Child";

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
        <div className="flex justify-center relative">
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
            onFlip={() => {
              if (showHint) {
                setShowHint(false);
                localStorage.setItem("flip_hint_seen", "true");
              }
            }}
          >
            {Array.from({ length: totalPages }).map((_, index) => {

              /* ===============================
                 COVER PAGE (index 0)
              ================================ */
              if (index === 0) {
                return (
                  <div
                    key="cover"
                    className="relative bg-[#fffaf0] border border-yellow-200
                               rounded-lg overflow-hidden flex flex-col"
                  >
                    {/* COVER IMAGE (PAGE 1 IMAGE) */}
                    <div className="px-6 pt-8">
                      <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <img
                          src={`${backendBase}/images/${data.bookId}/page_1.png`}
                          onError={(e) =>
                            (e.currentTarget.src =
                              `${backendBase}/${data.previewImage}`)
                          }
                          className="w-full h-[300px] object-contain"
                        />
                      </div>
                    </div>

                    {/* TITLE */}
                    <div className="pt-6 text-center px-6">
                      <h1 className="text-2xl font-bold text-brandPurple mb-2">
                        {childName}’s Story
                      </h1>
                      <p className="text-sm tracking-widest text-gray-500 uppercase">
                        A Personalized Storybook
                      </p>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-auto pb-6 text-center text-xs text-gray-400 italic">
                      Created with ❤️ by Jr Billionaire
                    </div>

                    {/* NEXT ARROW */}
                    <div className="absolute bottom-4 right-4 text-gray-400 animate-pulse">
                      ➡
                    </div>
                  </div>
                );
              }

              /* ===============================
                 STORY PAGES
              ================================ */
              const storyIndex = index - 1;
              const text = pages[storyIndex];
              const isFree = storyIndex < FREE_PAGES;
              const isLocked = !isFree && !paid;

              return (
                <div
                  key={index}
                  className="relative bg-[#fffaf0] border border-yellow-200
                             rounded-lg overflow-hidden flex flex-col"
                >
                  {/* CHILD NAME */}
                  <div className="pt-4 pb-2 text-center text-sm font-medium text-gray-500">
                    {childName}’s Story
                  </div>

                  {/* IMAGE */}
                  <div className="px-6 pt-2">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <img
                        src={`${backendBase}/images/${data.bookId}/page_${storyIndex + 1}.png`}
                        onError={(e) =>
                          (e.currentTarget.src =
                            `${backendBase}/${data.previewImage}`)
                        }
                        className={`w-full h-[260px] object-contain ${
                          isLocked ? "blur-[14px]" : ""
                        }`}
                      />
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                      )}
                    </div>
                  </div>

                  {/* STORY TEXT */}
                  {!isLocked && (
                    <div className="px-6 pt-5 pb-4 text-center text-sm leading-relaxed
                                    text-gray-800 font-medium flex-1">
                      {text}
                    </div>
                  )}

                  {/* PAGE NUMBER */}
                  <div className="pb-3 text-center text-xs text-gray-400">
                    {storyIndex + 1}
                  </div>

                  {/* NEXT ARROW */}
                  {!isLocked && storyIndex < storyPagesCount - 1 && (
                    <div className="absolute bottom-3 right-4 text-gray-400 animate-pulse">
                      ➡
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
                          Unlock the full storybook to continue your magical journey ✨
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
                          Pay ₹999 to Unlock Full Book
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </HTMLFlipBook>

          {/* FLIP HINT */}
          {showHint && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2
                            text-sm text-gray-500 animate-pulse">
              👉 Swipe or drag the page to turn it
            </div>
          )}
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
