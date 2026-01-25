import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brandRed flex items-center justify-center px-4 py-12">

      <section className="max-w-4xl mx-auto text-center bg-white rounded-[2.5rem] px-8 py-14 shadow-[0_30px_80px_rgba(0,0,0,0.25)] relative overflow-hidden">
        
        <div className="absolute -top-32 -right-32 
  w-[300px] h-[300px] 
  border-[6px] border-black/10 
  rounded-full">
        </div>



        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="relative">
            <img
              src="/logo.png"
              alt="Jr. Billionaire Logo"
              className="w-20 h-20 object-contain"
            />
            <span className="absolute -top-4 -right-4 text-brandRed text-lg">✨</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-black">

            Magic Storybook Creator
          </h1>
        </div>

        <div className="flex items-center justify-center gap-1 mb-8">
          <div className="flex text-brandRed text-xl">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <span className="text-brandText ml-2">Loved by 10,000+ families</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-brandText mb-4">
          Make your Child Learn with{" "}
          <span className="text-brandRed">Customized Visual Stories!</span>

        </h2>

        <p className="text-brandText text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
          Create a magical 10-page visual storybook where your child becomes a 3D character —
          fully customized with your own story!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10">
          <div className="flex items-center gap-2 text-brandText">
            <span className="text-brandRed text-xl">♡</span>

            <span className="font-medium">Builds Confidence</span>
          </div>
          <div className="flex items-center gap-2 text-brandText">
            <span className="text-black text-xl">📖</span>
            <span className="font-medium">Encourages Reading</span>
          </div>
          <div className="flex items-center gap-2 text-brandText">
            <span className="text-black text-xl">✨</span>
            <span className="font-medium">Sparks Imagination</span>
          </div>
        </div>

        <div className="bg-brandRedSoft rounded-2xl py-4 px-6 md:px-10 shadow-sm border border-brandRed/20 inline-block">

          <p className="text-lg">
            <span className="text-xl mr-2">🔥</span>
            <span className="text-brandRed font-semibold">Limited Time:</span>

            <span className="text-brandText ml-1">
              Create your First Storybook with FREE Pages!
            </span>
          </p>
        </div>

        {/* CTA BUTTON */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate("/create")}
            className="px-10 py-4 rounded-full bg-brandRed text-white text-lg font-bold shadow-lg hover:bg-black hover:scale-105 transition"
          >

            Create My Storybook ✨
          </button>
        </div>

      </section>
    </div>
  );
};

export default Index;
