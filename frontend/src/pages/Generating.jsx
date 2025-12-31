import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Generating() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(5);
  const [stepIndex, setStepIndex] = useState(0);

  const hasCalledAPI = useRef(false);
  const isMounted = useRef(true);

  const steps = [
    "✨ Opening the magic book...",
    "🧒 Creating your hero...",
    "📝 Writing the story...",
    "🎨 Painting beautiful pictures...",
    "📖 Binding the storybook...",
    "🎉 Almost ready!",
  ];

  useEffect(() => {
    const payload = JSON.parse(localStorage.getItem("storyPayload"));
    if (!payload) return;

    isMounted.current = true;

    /* ---------- STEP TEXT ---------- */
    const stepTimer = setInterval(() => {
      if (!isMounted.current) return;
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1400);

    /* ---------- PROGRESS (MAX 85%) ---------- */
    const progressTimer = setInterval(() => {
      if (!isMounted.current) return;
      setProgress((prev) => (prev >= 85 ? prev : prev + 1));
    }, 120);

    /* ---------- START GENERATION ---------- */
    if (!hasCalledAPI.current) {
      hasCalledAPI.current = true;

      (async () => {
        try {
          const formData = new FormData();
          formData.append("name", payload.name);
          formData.append("age", payload.age);
          formData.append("gender", payload.gender);
          formData.append("interest", payload.interest);

          // 🔥 START STORY GENERATION
          await fetch(
            `${import.meta.env.VITE_API_URL}/story/generate`,
            { method: "POST", body: formData }
          );

          const bookId = `${payload.name}_${payload.age}_${payload.interest}`.toLowerCase();

          /* ---------- WAIT FOR PREVIEW IMAGE ---------- */
          const waitForPreview = setInterval(async () => {
            try {
              const res = await fetch(
                `${import.meta.env.VITE_API_URL}/story/result/${bookId}`
              );
              const result = await res.json();

              // ✅ ONLY WHEN IMAGE EXISTS
              if (result.ready && result.previewImage) {
                clearInterval(waitForPreview);
                clearInterval(progressTimer);
                clearInterval(stepTimer);

                localStorage.setItem(
                  "storyResult",
                  JSON.stringify(result)
                );

                // 🔥 NOW COMPLETE PROGRESS
                setProgress(100);

                setTimeout(() => {
                  if (isMounted.current) navigate("/preview");
                }, 600);
              }
            } catch (err) {
              console.error(err);
            }
          }, 2000);
        } catch (err) {
          console.error(err);
          alert("Something went wrong 😢");
        }
      })();
    }

    return () => {
      isMounted.current = false;
      clearInterval(stepTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brandBg to-white flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-[0_35px_90px_rgba(0,0,0,0.18)] px-12 py-14 text-center relative overflow-hidden">

        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brandPurple/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-8xl mb-8 animate-bounce">
          📖
        </div>

        <h1 className="relative z-10 text-4xl font-bold text-brandPurple mb-4">
          Creating Your Storybook
        </h1>

        <p className="relative z-10 text-lg text-brandText mb-12">
          {steps[stepIndex]}
        </p>

        <div className="relative z-10 w-full max-w-2xl mx-auto bg-gray-200 rounded-full h-4 overflow-hidden mb-4">
          <div
            className="bg-brandPurple h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="relative z-10 text-sm text-brandMuted">
          {progress}% completed
        </p>

        <p className="relative z-10 mt-6 text-base text-brandText">
          🧸 Please wait — preview image is being prepared
        </p>
      </div>
    </div>
  );
}
