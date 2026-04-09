import { BsShieldLock } from 'react-icons/bs';
import { FiCheckCircle } from 'react-icons/fi';

export default function AuthBranding() {
  return (
    <div className="hidden lg:flex flex-col items-center text-white space-y-6 p-8">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
          <BsShieldLock className="w-12 h-12 text-blue-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">ProjectHub</h1>
          <p className="text-blue-200">Management Platform</p>
        </div>
      </div>

      <div className="space-y-4 text-center">
        <p className="text-lg text-slate-300">
          Manage your projects, track progress, and collaborate with your team efficiently.
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <FiCheckCircle className="text-green-400" />
            <span>Task Management</span>
          </div>
          <div className="flex items-center space-x-2">
            <FiCheckCircle className="text-green-400" />
            <span>Team Collaboration</span>
          </div>
          <div className="flex items-center space-x-2">
            <FiCheckCircle className="text-green-400" />
            <span>Time Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
