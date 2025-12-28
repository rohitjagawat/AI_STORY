import { useNavigate } from "react-router-dom";
import { useState } from "react";

const CreateStory = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [interest, setInterest] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [childPhoto, setChildPhoto] = useState(null);


  const handleSubmit = () => {
    if (!name || !age || !interest || !gender) {
      setError("Fill all details");
      return;
    }

    // 🔑 data temporarily save
    localStorage.setItem(
      "storyPayload",
      JSON.stringify({ name, age, gender, interest })
    );

    // 🚀 IMMEDIATE redirect
    navigate("/generating");
  };




  return (
    <div className="min-h-screen bg-brandBg flex justify-center px-4 py-12">
      <div className="w-full max-w-3xl">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-brandPurple mb-3">
            Create Your Child’s Story ✨
          </h1>
          <p className="text-brandText text-lg">
            Just a few details and we’ll turn it into a magical visual storybook
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">

          {/* ERROR */}
          {error && (
            <div className="mb-6 text-center text-red-500 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* NAME */}
          <div className="mb-6">
            <label className="block text-brandText font-medium mb-2">
              Child’s Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="e.g. Aarav"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brandPurple"
            />
          </div>

          {/* AGE */}
          <div className="mb-6">
            <label className="block text-brandText font-medium mb-2">
              Age
            </label>
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              type="number"
              placeholder="e.g. 6"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brandPurple"
            />
          </div>

          {/* GENDER */}
          <div className="mb-6">
            <label className="block text-brandText font-medium mb-3">
              Gender
            </label>

            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setGender("boy")}
                className={`flex items-center gap-2 px-5 py-3 rounded-full border transition
                  ${gender === "boy"
                    ? "bg-brandPurple text-white border-brandPurple"
                    : "border-brandPurple text-brandPurple hover:bg-brandPurple hover:text-white"
                  }`}
              >
                <span className="text-xl">👦</span>
                Boy
              </button>

              <button
                type="button"
                onClick={() => setGender("girl")}
                className={`flex items-center gap-2 px-5 py-3 rounded-full border transition
                  ${gender === "girl"
                    ? "bg-brandPurple text-white border-brandPurple"
                    : "border-brandPurple text-brandPurple hover:bg-brandPurple hover:text-white"
                  }`}
              >
                <span className="text-xl">👧</span>
                Girl
              </button>
            </div>
          </div>

          {/* INTEREST */}
          <div className="mb-8">
            <label className="block text-brandText font-medium mb-2">
              Child’s Interest
            </label>
            <input
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              type="text"
              placeholder="e.g. Dinosaurs, Space, Princess"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brandPurple"
            />
          </div>
          <div className="mb-8">
            <label className="block text-brandText font-medium mb-2">
              Upload Your Child’s Photo 📸
            </label>

            <p className="text-sm text-brandMuted mb-3">
              This helps us create a story character that looks more like your child
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setChildPhoto(e.target.files[0])}
              className="w-full px-4 py-3 border border-dashed border-brandPurple rounded-xl bg-brandBg cursor-pointer"
            />
          </div>



          {/* CTA */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-10 py-4 rounded-full bg-brandPurple text-white text-lg font-semibold shadow-lg hover:scale-105 transition mt-5"
            >
              Generate Storybook 🚀
            </button>
          </div>

        </div>

        <p className="text-center text-brandMuted text-sm mt-6">
          ⏳ Story generation usually takes less than a minute
        </p>

      </div>
    </div>
  );
};

export default CreateStory;
