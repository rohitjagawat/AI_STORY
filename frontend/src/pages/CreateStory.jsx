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

  const [challenges, setChallenges] = useState([]);
  const [siblingName, setSiblingName] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handleSubmit = () => {
    // 🧹 CLEAR OLD STORY DATA
    localStorage.removeItem("storyPayload");
    localStorage.removeItem("storyResult");
    localStorage.removeItem("paidBookId");

    if (!name || !age || !interest || !gender) {
      setError("Please fill all required details");
      return;
    }

    // 🔐 SAVE STORY PAYLOAD (ONLY ONCE)
    localStorage.setItem(
      "storyPayload",
      JSON.stringify({
        name,
        age,
        gender,
        interest,
        challenges,
        siblingName,
        additionalInfo,
        hasPhoto: !!childPhoto,
      })
    );

    // 🚀 REDIRECT (API CALL HAPPENS IN Generating.jsx)
    navigate("/generating");
  };

  return (
    <div className="min-h-screen bg-brandBg flex justify-center px-4 py-12">
      <div className="w-full max-w-3xl">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-brandPurple mb-3">
            Create Your Child’s Story ✨
          </h1>
          <p className="text-brandText text-lg">
            Share a few details and we’ll create a magical storybook
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">

          {error && (
            <div className="mb-6 text-center text-red-500 font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-10">

            {/* CHILD DETAILS */}
            <div>
              <h2 className="text-xl font-semibold text-brandPurple mb-4">
                👶 Child Details
              </h2>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Child’s Name"
                className="w-full mb-4 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brandPurple"
              />

              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                type="number"
                placeholder="Age"
                className="w-full mb-4 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brandPurple"
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setGender("boy")}
                  className={`px-6 py-3 rounded-full border ${
                    gender === "boy"
                      ? "bg-brandPurple text-white"
                      : "border-brandPurple text-brandPurple"
                  }`}
                >
                  👦 Boy
                </button>

                <button
                  onClick={() => setGender("girl")}
                  className={`px-6 py-3 rounded-full border ${
                    gender === "girl"
                      ? "bg-brandPurple text-white"
                      : "border-brandPurple text-brandPurple"
                  }`}
                >
                  👧 Girl
                </button>
              </div>
            </div>

            {/* STORY PREFERENCES */}
            <div>
              <h2 className="text-xl font-semibold text-brandPurple mb-4">
                📖 Story Preferences
              </h2>

              <input
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="Child’s Interest"
                className="w-full mb-4 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brandPurple"
              />

              <div className="flex flex-wrap gap-3">
                {[
                  "Obedience",
                  "Fighting",
                  "Hitting",
                  "Tantrums",
                  "Fear",
                  "Confidence",
                  "Expressing Emotions",
                  "Anger Suppression",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setChallenges((prev) =>
                        prev.includes(c)
                          ? prev.filter((x) => x !== c)
                          : prev.length < 3
                          ? [...prev, c]
                          : prev
                      )
                    }
                    className={`px-4 py-2 rounded-full border ${
                      challenges.includes(c)
                        ? "bg-brandPurple text-white"
                        : "border-brandPurple text-brandPurple"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* PERSONAL TOUCH */}
            <div>
              <h2 className="text-xl font-semibold text-brandPurple mb-4">
                ❤️ Personal Touch
              </h2>

              <input
                value={siblingName}
                onChange={(e) => setSiblingName(e.target.value)}
                placeholder="Sibling Name (optional)"
                className="w-full mb-4 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brandPurple"
              />

              <textarea
                rows={4}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Additional info (optional)"
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brandPurple"
              />
            </div>

            {/* CTA */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                className="px-12 py-4 rounded-full bg-brandPurple text-white text-lg font-semibold shadow-lg hover:scale-105 transition"
              >
                Create My Child’s Story ✨
              </button>
            </div>
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
