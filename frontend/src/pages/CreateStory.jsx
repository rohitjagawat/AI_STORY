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
    localStorage.removeItem("storyPayload");
    localStorage.removeItem("storyResult");
    localStorage.removeItem("paidBookId");

    if (!name || !age || !interest || !gender) {
      setError("Please fill all required details");
      return;
    }

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

    navigate("/generating");
  };

  return (
    <div className="min-h-screen bg-brandRed flex justify-center px-4 py-12">
      <div className="w-full max-w-3xl">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-3">
            Create Your Child’s Story ✨
          </h1>
          <p className="text-brandText text-lg">
            Share a few details and we’ll create a gentle, magical storybook
            made just for your child
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.25)] p-6 md:p-12 relative overflow-hidden">

         

          {error && (
            <div className="mb-6 text-center text-brandRed font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-10 relative z-10">

            {/* CHILD DETAILS */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">
                👶 Child Details
              </h2>

              <div className="mb-6">
                <label className="block text-brandText font-medium mb-2">
                  Child’s Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="e.g. Aarav"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-brandRed transition focus:outline-none focus:ring-2 focus:ring-brandRed"
                />
              </div>

              <div className="mb-6">
                <label className="block text-brandText font-medium mb-2">
                  Age
                </label>
                <input
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  type="number"
                  placeholder="e.g. 6"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-brandRed transition focus:outline-none focus:ring-2 focus:ring-brandRed"
                />
              </div>

              <div className="mb-6">
                <label className="block text-brandText font-medium mb-3">
                  Gender
                </label>
                <div className="flex gap-6">
                  <button
                    type="button"
                    onClick={() => setGender("boy")}
                    className={`px-6 py-3 rounded-full border transition font-medium ${gender === "boy"
                        ? "bg-brandRed text-white border-brandRed"
                        : "border-brandRed text-brandRed hover:bg-brandRed hover:text-white"
                      }`}
                  >
                    👦 Boy
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender("girl")}
                    className={`px-6 py-3 rounded-full border transition font-medium ${gender === "girl"
                        ? "bg-brandRed text-white border-brandRed"
                        : "border-brandRed text-brandRed hover:bg-brandRed hover:text-white"
                      }`}
                  >
                    👧 Girl
                  </button>
                </div>
              </div>
            </div>

            {/* STORY PREFERENCES */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">
                📖 Story Preferences
              </h2>

              <div className="mb-6">
                <label className="block text-brandText font-medium mb-2">
                  Child’s Interest
                </label>
                <input
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  type="text"
                  placeholder="e.g. Dinosaurs, Space, Princess"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-brandRed transition focus:outline-none focus:ring-2 focus:ring-brandRed"
                />
                <p className="text-sm text-brandMuted mt-2">
                  We’ll use this to shape the story’s world and adventures
                </p>
              </div>

              {/* CHALLENGES */}
              <div className="mb-6">
                <label className="block text-brandText font-medium mb-2">
                  What would you like this story to gently help with?
                </label>

                <p className="text-sm text-brandMuted mb-4">
                  Choose up to 3 areas your child is currently navigating
                </p>

                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Obedience", emoji: "🧩" },
                    { label: "Fighting", emoji: "🤼" },
                    { label: "Hitting", emoji: "✋" },
                    { label: "Tantrums", emoji: "🌋" },
                    { label: "Fear", emoji: "🌙" },
                    { label: "Confidence", emoji: "🌟" },
                    { label: "Expressing Emotions", emoji: "💬" },
                    { label: "Anger Suppression", emoji: "🔥" },
                  ].map(({ label, emoji }) => {
                    const selected = challenges.includes(label);
                    const disabled = !selected && challenges.length >= 3;

                    return (
                      <button
                        key={label}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (selected) {
                            setChallenges(challenges.filter((c) => c !== label));
                          } else if (challenges.length < 3) {
                            setChallenges([...challenges, label]);
                          }
                        }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-medium transition-all ${selected
                            ? "bg-brandRed text-white border-brandRed shadow-lg scale-105"
                            : disabled
                              ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                              : "bg-white text-brandRed border-brandRed hover:bg-brandRed hover:text-white hover:scale-105"
                          }`}
                      >
                        <span className="text-lg">{emoji}</span>
                        {label}
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-brandMuted mt-3">
                  {challenges.length}/3 selected
                </p>
              </div>
            </div>

            {/* PERSONAL TOUCH */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">
                ❤️ Personal Touch
              </h2>

              <div className="mb-6">
                <label className="block text-brandText font-medium mb-2">
                  Sibling Name (optional)
                </label>
                <input
                  value={siblingName}
                  onChange={(e) => setSiblingName(e.target.value)}
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-brandRed transition focus:outline-none focus:ring-2 focus:ring-brandRed"
                />
              </div>

              <div className="mb-6">
                <label className="block text-brandText font-medium mb-2">
                  Additional Information (optional)
                </label>
                <textarea
                  rows={4}
                  value={additionalInfo}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/);
                    if (words.length <= 100) {
                      setAdditionalInfo(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 hover:border-brandRed transition focus:outline-none focus:ring-2 focus:ring-brandRed"
                />
                <p className="text-xs text-brandMuted mt-2">
                  {additionalInfo.trim()
                    ? additionalInfo.trim().split(/\s+/).length
                    : 0}
                  /100 words
                </p>
              </div>
            </div>


            {/* PHOTO */}
            <div>
              <label className="block text-brandText font-medium mb-2">
                Upload Your Child’s Photo 📸{" "}
                <span className="text-sm text-brandMuted font-normal">(optional)</span>
              </label>

              <p className="text-sm text-brandMuted mb-3">
                This photo helps us design a story character inspired by your child’s look.
                The illustrations will be artistic, not an exact copy.
              </p>

              <ul className="text-xs text-brandMuted mb-4 list-disc list-inside space-y-1">
                <li>🙂 Clear face photo of one child</li>
                <li>🌤️ Good lighting (natural daylight works best)</li>
                <li>🚫 Avoid group photos, heavy filters, or sunglasses</li>
              </ul>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setChildPhoto(e.target.files[0])}
                className="w-full px-4 py-3 border border-dashed border-brandRed rounded-xl bg-brandRedSoft cursor-pointer hover:bg-white transition"
              />

              {childPhoto && (
                <p className="mt-2 text-xs text-green-600 font-medium">
                  ✅ Photo selected: {childPhoto.name}
                </p>
              )}
            </div>


            {/* CTA */}
            <div className="flex flex-col items-center mt-12">
              <button
                onClick={handleSubmit}
                className="px-12 py-4 rounded-full bg-brandRed text-white text-lg font-bold shadow-lg hover:bg-black hover:scale-105 transition"
              >
                Create My Child’s Story ✨
              </button>

              <p className="text-center text-sm text-brandMuted mt-4">
                You’ll be able to preview the story before unlocking the full book
              </p>
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
