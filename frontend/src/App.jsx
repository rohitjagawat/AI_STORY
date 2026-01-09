import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import CreateStory from "./pages/CreateStory";
import Generating from "./pages/Generating";
import Preview from "./pages/Preview";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateStory />} />
        <Route path="/generating" element={<Generating />} />
        <Route path="/preview" element={<Preview />} />
        <Route
          path="/pdf-view/:storyId"
          element={<Preview pdfMode={true} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
