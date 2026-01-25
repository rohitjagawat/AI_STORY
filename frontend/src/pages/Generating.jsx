import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Generating() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(3);
  const [stepIndex, setStepIndex] = useState(0);

  const hasStarted = useRef(false);
  const pollerRef = useRef(null);
  const isMounted = useRef(true);

  const steps = [
    "✨ Opening the magic book…",
    "🧒 Creating your hero…",
    "📝 Writing the story…",
    "🎨 Painting beautiful illustrations…",
    "📖 Binding the storybook…",
    "🎉 Final touches in progress…",
  ];

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const payload = JSON.parse(localStorage.getItem("storyPayload"));
    if (!payload) {
      navigate("/");
      return;
    }

    localStorage.removeItem("storyResult");
    localStorage.removeItem("paidBookId");

    isMounted.current = true;

    /* ---------------- STEP TEXT ---------------- */
    const stepTimer = setInterval(() => {
      if (!isMounted.current) return;
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 600);

    /* ---------------- PROGRESS (VERY SMOOTH) ---------------- */
   const progressTimer = setInterval(() => {
  if (!isMounted.current) return;

  setProgress((prev) => {
    if (prev < 95) return prev + 1; // constant speed
    return prev; // wait at 95 for backend
  });
}, 500); // 👈 speed control


    /* ---------------- START GENERATION ---------------- */
    (async () => {
      try {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("age", payload.age);
        formData.append("gender", payload.gender);
        formData.append("interest", payload.interest);
        formData.append("challenges", JSON.stringify(payload.challenges || []));
        formData.append("siblingName", payload.siblingName || "");
        formData.append("additionalInfo", payload.additionalInfo || "");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/story/generate`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        const bookId = data.bookId;
 
        /* ---------------- POLL RESULT ---------------- */
        pollerRef.current = setInterval(async () => {
          try {
            const r = await fetch(
              `${import.meta.env.VITE_API_URL}/story/result/${bookId}`
            );
            const result = await r.json();

            if (result.ready && result.previewImage) {
              clearInterval(pollerRef.current);
              clearInterval(stepTimer);
              clearInterval(progressTimer);

              localStorage.setItem(
                "storyResult",
                JSON.stringify({
                  ...result,
                  bookId,
                  input: {
                    name: payload.name,
                    age: payload.age,
                    gender: payload.gender,
                    interest: payload.interest,
                  },
                })
              );

              setProgress(100);

              setTimeout(() => {
                if (isMounted.current) navigate("/preview");
              }, 800);
            }
          } catch (err) {
            console.error(err);
          }
        }, 2500);
      } catch (err) {
        console.error(err);
        alert("Something went wrong 😢");
      }
    })();

    return () => {
      isMounted.current = false;
      clearInterval(stepTimer);
      clearInterval(progressTimer);
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-brandRed flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-[0_35px_90px_rgba(0,0,0,0.25)] px-10 py-16 text-center relative overflow-hidden">


        {/* Book icon */}
        <div className="relative z-10 text-7xl mb-6 animate-bounce">
          📖
        </div>

        <h1 className="relative z-10 text-4xl font-extrabold text-black mb-3">
          Creating Your Storybook
        </h1>

        <p className="relative z-10 text-lg text-brandText mb-10">
          {steps[stepIndex]}
        </p>

        {/* Progress bar */}
        <div className="relative z-10 w-full max-w-xl mx-auto bg-gray-200 rounded-full h-4 overflow-hidden mb-4">
          <div
            className="bg-brandRed h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="relative z-10 text-sm text-brandMuted">
          {progress}% completed
        </p>

        <p className="relative z-10 mt-6 text-base text-brandText">
          🧸 Please wait — magic takes a little time
        </p>
      </div>
    </div>
  );
}
