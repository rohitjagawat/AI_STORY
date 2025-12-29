import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Generating() {
  const navigate = useNavigate();

  console.log(import.meta.env.VITE_API_URL);


  const [progress, setProgress] = useState(0);
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

    const progressTimer = setInterval(() => {
      if (!isMounted.current) return;
      setProgress((prev) => (prev >= 95 ? prev : prev + 1));
    }, 80);

    const stepTimer = setInterval(() => {
      if (!isMounted.current) return;
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1400);

    if (!hasCalledAPI.current) {
      hasCalledAPI.current = true;

      (async () => {
        try {
          const formData = new FormData();
          formData.append("name", payload.name);
          formData.append("age", payload.age);
          formData.append("gender", payload.gender);
          formData.append("interest", payload.interest);

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/story/generate`,
            {
              method: "POST",
              body: formData,
            }
          );


          const data = await res.json();
          localStorage.setItem("storyResult", JSON.stringify(data));

          if (!isMounted.current) return;

          setProgress(100);

          setTimeout(() => {
            if (isMounted.current) navigate("/preview");
          }, 1200);
        } catch (err) {
          console.error(err);
          alert("Something went wrong 😢");
        }
      })();
    }

    return () => {
      isMounted.current = false;
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brandBg to-white flex items-center justify-center px-4 py-12">

      {/* MAIN PREMIUM BLOCK */}
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-[0_35px_90px_rgba(0,0,0,0.18)] px-12 py-14 text-center relative overflow-hidden">

        {/* Decorative glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brandPurple/10 rounded-full blur-3xl"></div>

        {/* Floating sparkles */}
        <div className="absolute top-6 left-6 text-4xl animate-pulse">✨</div>
        <div className="absolute top-6 right-6 text-4xl animate-pulse">🌟</div>
        <div className="absolute bottom-6 right-10 text-4xl animate-pulse">✨</div>
        <div className="absolute bottom-6 left-10 text-4xl animate-pulse">✨</div>
        {/* Book icon */}
        <div className="relative z-10 text-8xl mb-8 animate-bounce">
          📖
        </div>

        {/* Title */}
        <h1 className="relative z-10 text-4xl md:text-5xl font-bold text-brandPurple mb-4">
          Creating Your Storybook
        </h1>

        {/* Step text */}
        <p className="relative z-10 text-lg md:text-xl text-brandText mb-12 transition-all duration-500">
          {steps[stepIndex]}
        </p>

        {/* Progress bar */}
        <div className="relative z-10 w-full max-w-2xl mx-auto bg-gray-200 rounded-full h-4 overflow-hidden mb-4">
          <div
            className="bg-brandPurple h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress text */}
        <p className="relative z-10 text-sm text-brandMuted">
          {progress}% completed
        </p>

        {/* Helper text */}
        <p className="relative z-10 mt-6 text-base text-brandText">
          🧸 Sit back & relax — your child’s magical story is being crafted.
        </p>
      </div>
    </div>
  );
}
