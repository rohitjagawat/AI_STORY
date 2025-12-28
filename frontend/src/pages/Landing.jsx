import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brandBg flex items-center justify-center px-4 py-12">
      <section className="max-w-3xl mx-auto text-center">

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="relative">
            <svg className="w-12 h-12 text-brandPurple" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z"/>
            </svg>
            <span className="absolute -top-5 -right-5 text-yellow-500 text-lg">✨</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brandPurple">
            Magic Storybook Creator
          </h1>
        </div>

        <div className="flex items-center justify-center gap-1 mb-8">
          <div className="flex text-yellow-400 text-xl">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <span className="text-brandText ml-2">Loved by 10,000+ families</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-brandText mb-4">
          Make your Child Learn with{" "}
          <span className="text-brandPurple">Customized Visual Stories!</span>
        </h2>

        <p className="text-brandText text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
          Create a magical 10-page visual storybook where your child becomes a 3D character —
          fully customized with your own story!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10">
          <div className="flex items-center gap-2 text-brandText">
            <span className="text-brandPink text-xl">♡</span>
            <span className="font-medium">Builds Confidence</span>
          </div>
          <div className="flex items-center gap-2 text-brandText">
            <span className="text-brandPurple text-xl">📖</span>
            <span className="font-medium">Encourages Reading</span>
          </div>
          <div className="flex items-center gap-2 text-brandText">
            <span className="text-brandPurple text-xl">✨</span>
            <span className="font-medium">Sparks Imagination</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl py-4 px-6 md:px-10 shadow-sm border border-orange-100 inline-block">
          <p className="text-lg">
            <span className="text-xl mr-2">🔥</span>
            <span className="text-brandOrange font-semibold">Limited Time:</span>
            <span className="text-brandText ml-1">
              Create your First Storybook with FREE Pages!
            </span>
          </p>
        </div>

        {/* CTA BUTTON */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate("/create")}
            className="px-8 py-4 rounded-full bg-brandPurple text-white text-lg font-semibold shadow-lg hover:scale-105 transition"
          >
            Create My Storybook ✨
          </button>
        </div>

      </section>
    </div>
  );
};

export default Index;
