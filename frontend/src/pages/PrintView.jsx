import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PrintView() {
  const { bookId } = useParams();
  const [data, setData] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const backendBase = API_URL.replace("/api", "");

  useEffect(() => {
    // Story ka data fetch karo
    fetch(`${API_URL}/story/result/${bookId}`).then(res => res.json()).then(setData);
  }, [bookId]);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ background: "white" }}>
      {data.story.pages.map((text, i) => (
        <div key={i} className="pdf-page" style={{ 
          width: "794px", height: "1123px", // A4 Size
          pageBreakAfter: "always", position: "relative",
          backgroundColor: "#fffaf0" 
        }}>
          {/* 1. Image (70% height) */}
          <img 
            src={`${backendBase}/images/${bookId}/page_${i + 1}.png`} 
            style={{ width: "100%", height: "70%", objectFit: "cover" }} 
          />
          {/* 2. Story Text (30% height) */}
          <div style={{ 
            padding: "40px", textAlign: "center", 
            fontSize: "24px", color: "#333", fontWeight: "500" 
          }}>
            {text}
          </div>
          {/* 3. Page Number */}
          <div style={{ position: "absolute", bottom: "20px", width: "100%", textAlign: "center" }}>
            {i + 1}
          </div>
        </div>
      ))}
    </div>
  );
}