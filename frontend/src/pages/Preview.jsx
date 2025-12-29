import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
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
      } catch (e) {
        console.error(e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        ⏳ Creating your magical story…
      </div>
    );
  }

  if (status === "error") {
    return <div className="text-center">No story found</div>;
  }

  return (
    <div className="min-h-screen bg-brandBg flex items-center justify-center px-4 py-10">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-6 text-center">
        <h1 className="text-2xl font-bold text-brandPurple mb-4">
          Your Storybook is Ready 📘✨
        </h1>

        <div className="text-left mb-6 max-h-64 overflow-y-auto border rounded-xl p-4">
          {story.pages.map((page, i) => (
            <p key={i} className="mb-3">
              {page}
            </p>
          ))}
        </div>

        <button
          onClick={() => navigate("/create")}
          className="text-brandPurple underline"
        >
          ➕ Create Another Story
        </button>
      </div>
    </div>
  );
}
