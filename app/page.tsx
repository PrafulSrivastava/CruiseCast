import AnimatedCarMap from "./AnimatedCarMap";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center">
      <header className="w-full py-8 bg-white/80 shadow-md flex flex-col items-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight mb-2">CruiseCast Demo</h1>
        <p className="text-lg text-gray-700 max-w-2xl text-center">
          Visualize optimal cruise control speeds for vehicles along a city route. Adjust animation speed, inspect clustered speed profiles, and see how cruise control adapts in real time.
        </p>
      </header>
      <main className="w-full flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white/90 rounded-xl shadow-lg p-6 mb-12">
          <AnimatedCarMap />
        </div>
      </main>
      <footer className="mt-auto py-4 text-gray-500 text-sm text-center w-full">
        &copy; {new Date().getFullYear()} CruiseCast MVP &mdash; Hackathon Demo
      </footer>
    </div>
  );
}
