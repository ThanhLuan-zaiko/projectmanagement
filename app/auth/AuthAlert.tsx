import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface AuthAlertProps {
  type: 'error' | 'success';
  message: string;
}

export default function AuthAlert({ type, message }: AuthAlertProps) {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      text: 'text-red-300',
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      icon: 'text-green-400',
      text: 'text-green-300',
    },
  };

  const style = styles[type];

  return (
    <div className={`mb-6 p-4 ${style.bg} border ${style.border} rounded-xl flex items-center space-x-3`}>
      <FiAlertCircle className={`w-5 h-5 ${style.icon} flex-shrink-0`} />
      <p className={`${style.text} text-sm`}>{message}</p>
    </div>
  );
}
