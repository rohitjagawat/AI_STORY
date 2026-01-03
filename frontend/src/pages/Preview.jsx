import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const backendBase = API_URL.replace("/api", "");

  useEffect(() => {
    const result = JSON.parse(localStorage.getItem("storyResult"));

    if (!result || !result.bookId) {
      navigate("/create");
      return;
    }

    setData(result);
    console.log("PREVIEW DATA 👉", result);
console.log("IMAGES 👉", result.images);


    fetch(`${API_URL}/payment/has-paid?bookId=${result.bookId}`)
      .then((res) => res.json())
      .then((d) => setPaid(d.paid))
      .catch(() => setPaid(false));
  }, [API_URL, navigate]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No preview available
      </div>
    );
  }

  const images = data.images || [];

  return (
    <div className="min-h-screen bg-brandBg px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brandPurple">
            Your Child Is the Hero 🌟
          </h1>
          <p className="text-brandText mt-2">
            A magical storybook made just for {data.childName || "your child"}
          </p>
        </div>

        {/* IMAGE PREVIEW STACK */}
        <div className="space-y-8">
          {images.map((img, index) => {
            const imageUrl = `${backendBase}/${img}`;

            // FIRST 2 IMAGES — CLEAR
            if (index < 2 || paid) {
              return (
                <div key={index} className="bg-white p-4 rounded-2xl shadow">
                  <img
                    src={imageUrl}
                    alt={`Page ${index + 1}`}
                    className="w-full rounded-xl"
                  />
                </div>
              );
            }

            // LOCKED IMAGES
            return (
              <div
                key={index}
                className="relative bg-white p-4 rounded-2xl shadow overflow-hidden"
              >
                <img
                  src={imageUrl}
                  alt={`Locked Page ${index + 1}`}
                  className="w-full rounded-xl blur-md scale-105"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-center px-6">
                  <div className="text-2xl mb-2">🔒</div>
                  <p className="font-semibold mb-4">
                    Unlock the rest of the story
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
                      🔐 Pay ₹999 to Unlock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* BENEFITS CARD (ONLY IF NOT PAID) */}
        {paid === false && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-3 text-sm">
            <p className="font-semibold text-brandPurple">
              What you’ll get after unlocking:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>10 beautifully illustrated pages</li>
              <li>Personalized with your child’s name</li>
              <li>High-quality printable PDF</li>
              <li>Instant access after payment</li>
            </ul>
          </div>
        )}

        {/* PAID SUCCESS */}
        {paid === true && (
          <div className="bg-green-100 text-green-800 rounded-2xl p-6 text-center font-medium">
            🎉 Payment successful! Your full storybook is unlocked.
            <button
              onClick={() =>
                window.open(`${API_URL}/view/${data.bookId}`, "_blank")
              }
              className="block mt-4 w-full px-6 py-3 rounded-full bg-green-600 text-white font-semibold"
            >
              👀 View Full Storybook
            </button>
          </div>
        )}

        {/* CREATE ANOTHER */}
        <div className="text-center">
          <button
            onClick={() => {
              localStorage.removeItem("storyPayload");
              localStorage.removeItem("storyResult");
              localStorage.removeItem("paidBookId");
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
