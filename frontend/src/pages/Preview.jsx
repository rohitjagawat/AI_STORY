import { useNavigate } from "react-router-dom";

export default function Preview() {
  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem("storyResult"));

  if (!data) {
    return <p className="text-center mt-10">No story found</p>;
  }

  return (
    <div className="min-h-screen bg-brandBg flex items-center justify-center px-4 py-10">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-6 text-center">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-brandPurple mb-4">
          Your Storybook is Ready 📘✨
        </h1>

        {/* FIRST IMAGE PREVIEW */}
        <img
          src={`http://localhost:5000/${data.previewImage}`}
          alt="Story preview"
          className="w-full rounded-xl shadow-lg object-contain mb-6"
        />

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-4 mb-6">
          {/* VIEW PDF */}
          <a
            href={`http://localhost:5000/${data.pdfPath}`}
            target="_blank"
            className="px-6 py-3 rounded-full bg-brandPurple text-white font-semibold shadow-md hover:scale-105 transition"
          >
            View Full Storybook 👀
          </a>

          {/* DOWNLOAD PDF */}
          <a
            href={`http://localhost:5000/${data.pdfPath}`}
            download
            className="px-6 py-3 rounded-full border-2 border-brandPurple text-brandPurple font-semibold hover:bg-brandPurple hover:text-white transition"
          >
            Download Storybook ⬇️
          </a>
        </div>

        {/* CREATE ANOTHER STORY */}
        <button
          onClick={() => {
            navigate("/create");
          }}
          className="text-brandPurple font-medium underline hover:opacity-80"
        >
          ➕ Create Another Story
        </button>


      </div>
    </div>
  );
}
