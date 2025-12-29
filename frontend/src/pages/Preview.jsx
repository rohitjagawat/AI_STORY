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
