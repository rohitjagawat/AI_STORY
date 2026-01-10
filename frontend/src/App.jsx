import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import CreateStory from "./pages/CreateStory";
import Generating from "./pages/Generating";
import Preview from "./pages/Preview";
import PrintView from "./pages/PrintView"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateStory />} />
        <Route path="/generating" element={<Generating />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/print/:bookId" element={<PrintView />} />
      </Routes>
    </BrowserRouter>
  );
}
