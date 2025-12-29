import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const payload = JSON.parse(localStorage.getItem("storyPayload"));
    if (!payload) {
      setStatus("error");
      return;
    }

    const bookId = `${payload.name}_${payload.age}_${payload.interest}`.toLowerCase();

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/story/result/${bookId}`
        );

        const data = await res.json();

        if (data.ready) {
          setResult(data.story);
          setStatus("ready");
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000); // har 3 sec check

    return () => clearInterval(interval);
  }, []);

  // ❌ ERROR STATE
  if (status === "error") {
    return (
      <p className="text-center mt-10 text-red-500">
        No story found
      </p>
    );
  }

  // ⏳ LOADING STATE
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-brandBg flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
          <h2 className="text-xl font-semibold text-brandPurple mb-2">
            ✨ Creating your magical story...
          </h2>
          <p className="text-brandText">
            Please wait, this may take a few moments 🧸
          </p>
        </div>
      </div>
    );
  }

  // ✅ READY STATE (STORY AVAILABLE)
  return (
    <div className="min-h-screen bg-brandBg flex items-center justify-center px-4 py-10">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-6 text-center">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-brandPurple mb-4">
          Your Storybook is Ready 📘✨
        </h1>

        {/* STORY TEXT PREVIEW */}
        <div className="text-left mb-6 max-h-64 overflow-y-auto border rounded-xl p-4">
          {result.pages.map((page, index) => (
            <p key={index} className="mb-4 text-brandText">
              {page}
            </p>
          ))}
        </div>

        {/* CREATE ANOTHER STORY */}
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
