import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [story, setStory] = useState(null);

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
          setStory(data.story);
          setStatus("ready");
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000); // har 3 second poll

    return () => clearInterval(interval);
  }, []);

  // ❌ ERROR STATE
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        No story found
      </div>
    );
  }

  // ⏳ LOADING STATE
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-brandBg flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-brandPurple mb-3">
            ✨ Creating your magical story…
          </h2>
          <p className="text-brandText">
            Please wait, this may take a moment 🧸
          </p>
        </div>
      </div>
    );
  }

  // ✅ READY STATE
  return (
    <div className="min-h-screen bg-brandBg flex items-center justify-center px-4 py-10">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-6 text-center">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-brandPurple mb-4">
          Your Storybook is Ready 📘✨
        </h1>

        {/* STORY TEXT PREVIEW */}
        <div className="text-left mb-6 max-h-64 overflow-y-auto border rounded-xl p-4">
          {story.pages.map((page, index) => (
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
