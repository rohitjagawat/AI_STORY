import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [data, setData] = useState(null);

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

        const result = await res.json();

        if (result.ready) {
          setData(result);
          setStatus("ready");
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- ERROR ---------------- */
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        No story found
      </div>
    );
  }

  /* ---------------- LOADING ---------------- */
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

  /* ---------------- READY ---------------- */
  const backendBase = import.meta.env.VITE_API_URL.replace("/api", "");

  return (
    <div className="min-h-screen bg-brandBg flex items-center justify-center px-4 py-10">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-6 text-center">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-brandPurple mb-4">
          Your Storybook is Ready 📘✨
        </h1>

        {/* IMAGE PREVIEW */}
        {data.previewImage && (
          <img
            src={`${backendBase}/${data.previewImage}`}
            alt="Story preview"
            className="w-full rounded-xl shadow mb-4 object-contain"
          />
        )}

        {/* STORY TEXT */}
        <div className="text-left mb-6 max-h-64 overflow-y-auto border rounded-xl p-4">
          {data.story.pages.map((page, i) => (
            <p key={i} className="mb-3 text-brandText">
              {page}
            </p>
          ))}
        </div>

        {/* VIEW PDF */}
        {data.pdfPath && (
          <a
            href={`${backendBase}/${data.pdfPath}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full mb-3 px-6 py-3 rounded-full bg-brandPurple text-white font-semibold shadow-md hover:scale-105 transition"
          >
            View Full Storybook 👀
          </a>
        )}

        {/* DOWNLOAD PDF */}
        {data.pdfPath && (
          <a
            href={`${backendBase}/${data.pdfPath}`}
            download
            className="block w-full mb-4 px-6 py-3 rounded-full border-2 border-brandPurple text-brandPurple font-semibold hover:bg-brandPurple hover:text-white transition"
          >
            Download Storybook ⬇️
          </a>
        )}

        {/* CREATE ANOTHER */}
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
