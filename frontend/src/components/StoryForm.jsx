import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StoryForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    interest: ""
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.age || !form.interest) {
      alert("Please fill all fields");
      return;
    }

    const data = new FormData();
    data.append("name", form.name);
    data.append("age", form.age);
    data.append("interest", form.interest);
    if (photo) data.append("childPhoto", photo);

    try {
      setLoading(true);
      navigate("/generating");

      const res = await axios.post(
        "http://localhost:5000/api/story/generate",
        data
      );

      localStorage.setItem("storyResult", JSON.stringify(res.data));
      navigate("/preview");
    } catch (err) {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
    console.log("FORM DATA:", form);

  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        placeholder="Child Name"
        onChange={handleChange}
        className="w-full p-3 border rounded-xl"
      />

      <input
        name="age"
        placeholder="Age"
        onChange={handleChange}
        className="w-full p-3 border rounded-xl"
      />

      <input
        name="interest"
        placeholder="Interest (Space, Animals, Princess)"
        onChange={handleChange}
        className="w-full p-3 border rounded-xl"
      />

      <div className="border-2 border-dashed rounded-xl p-4 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />
        <p className="text-sm text-gray-500 mt-2">
          Optional: Upload child photo for personalized illustrations
        </p>
      </div>

      <button
        type="submit"
        className="w-full bg-magicPurple text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition"
      >
        Create Magic ✨
      </button>
    </form>
  );
}
