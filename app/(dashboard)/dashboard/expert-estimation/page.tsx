import { FiUsers, FiLoader } from 'react-icons/fi';

export default function ExpertEstimationPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
              <FiUsers className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Expert Time Estimation</h1>
            <p className="text-slate-400 mb-6 max-w-md">
              Get time estimations from experts for each task in your project.
            </p>
            <div className="flex items-center gap-2 text-green-400">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span className="text-sm">Coming Soon...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
