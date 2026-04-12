import { FiDollarSign, FiLoader } from 'react-icons/fi';

export default function CostEstimationPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/30">
              <FiDollarSign className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Project Cost Estimation</h1>
            <p className="text-slate-400 mb-6 max-w-md">
              Calculate and estimate costs for your project based on time and resources.
            </p>
            <div className="flex items-center gap-2 text-yellow-400">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span className="text-sm">Coming Soon...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
