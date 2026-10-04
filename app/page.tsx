import FormFlow from "./components/FormFlow";

export default function Home() {
  return (
    <main className="relative min-h-screen page-bg overflow-hidden">
      {/* Wordmark — swap for the Conciergite logo file once received */}
      <div className="absolute top-4 left-4 md:top-6 md:left-8 z-20">
        <span className="font-display text-lg md:text-xl font-semibold text-[#0B1F4D]">
          Concierg<span className="text-[#1D4ED8]">ite</span>
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 md:px-8 pt-16 md:pt-20 pb-10 md:pb-16 min-h-screen">
        <div className="w-full max-w-2xl mx-auto mb-5 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 text-[10px] text-[#1D4ED8] uppercase tracking-widest">
            <span className="w-1 h-1 rounded-full bg-[#1D4ED8] animate-pulse" />
            Analyse boostée par l&apos;IA
          </span>
        </div>

        <div className="w-full flex-1 flex flex-col">
          <FormFlow />
        </div>
      </div>
    </main>
  );
}
