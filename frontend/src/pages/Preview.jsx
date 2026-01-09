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
     LOAD STORY + PAYMENT POLLING
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
  const storyPageCount = data.story?.totalPages || pages.length;

  // +1 because COVER PAGE
  const totalFlipPages = storyPageCount + 1;

  const childName = data?.name || "Your Child";
  const bookTitle = `${childName}’s Magical Story`;

  return (
    <div className="min-h-screen bg-brandBg px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brandPurple">
            Your Personalized Storybook 📘
          </h1>
          <p className="mt-1 text-sm text-brandMuted italic">
            Flip pages like a real book ✨
          </p>
        </div>

        {/* BOOK */}
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
            mobileScrollSupport
            className="shadow-2xl"
          >
            {Array.from({ length: totalFlipPages }).map((_, flipIndex) => {

              /* ===============================
                 COVER PAGE (index 0)
              ================================ */
              if (flipIndex === 0) {
                return (
                  <div
                    key="cover"
                    className="relative w-full h-full overflow-hidden rounded-lg"
                  >
                    {/* FULL COVER IMAGE */}
                    <img
                      src={`${backendBase}/images/${data.bookId}/page_1.png`}
                      onError={(e) =>
                      (e.currentTarget.src =
                        `${backendBase}/${data.previewImage}`)
                      }
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t
                                    from-black/70 via-black/30 to-transparent" />

                    {/* TITLE */}
                    <div className="absolute top-14 w-full text-center px-6">
                      <h1 className="text-4xl font-extrabold text-white drop-shadow-xl">
                        {bookTitle}
                      </h1>
                      <p className="mt-3 text-sm tracking-widest uppercase text-white/80">
                        A Personalized Storybook
                      </p>
                    </div>

                    {/* FOOTER */}
                    <div className="absolute bottom-6 w-full text-center
                                    text-xs text-white/70 italic">
                      Created with ❤️ by Jr Billionaire
                    </div>

                    {/* FLIP HINT */}
                    <div className="absolute bottom-4 right-4
                                    text-white text-xl animate-pulse">
                      ➡
                    </div>
                  </div>
                );
              }

              /* ===============================
                 STORY PAGES (index 1+)
              ================================ */
              const storyIndex = flipIndex - 1;
              const text = pages[storyIndex];
              const isFree = storyIndex < FREE_PAGES;
              const isLocked = !isFree && !paid;

              return (
                <div
                  key={flipIndex}
                  className="relative bg-[#fffaf0] border border-yellow-200
                             rounded-lg overflow-hidden flex flex-col"
                >
                  {/* HEADER */}
                  <div className="pt-4 pb-2 text-center text-sm text-gray-500">
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
                        className={`w-full h-[260px] object-cover ${isLocked ? "blur-[14px]" : ""
                          }`}
                      />

                      {isLocked && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                      )}
                    </div>
                  </div>

                  {/* TEXT */}
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
                  {!isLocked && storyIndex < storyPageCount - 1 && (
                    <div className="absolute bottom-3 right-4 text-gray-400 animate-pulse">
                      ➡
                    </div>
                  )}

                  {/* LOCK */}
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
                          Pay ₹999 to Unlock
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
              ✅ Payment successful! Full story unlocked.
            </div>

            <button
              onClick={() =>
                window.open(`${API_URL}/view/${data.bookId}`, "_blank")
              }
              className="px-10 py-4 rounded-full bg-green-600 text-white font-semibold
                         shadow-lg hover:shadow-xl transition"
            >
              📘 View & Download PDF
            </button>
          </div>
        )}

        {/* CREATE NEW */}
        <div className="pt-16 flex justify-center">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/create");
            }}
            className="px-10 py-4 rounded-full border-2 border-brandPurple
                       text-brandPurple font-semibold hover:bg-brandPurple
                       hover:text-white transition shadow-md"
          >
            ✨ Create Another Story
          </button>
        </div>

      </div>
    </div>
  );
}
