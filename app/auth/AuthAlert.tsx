import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface AuthAlertProps {
  type: 'error' | 'success';
  message: string;
}

export default function AuthAlert({ type, message }: AuthAlertProps) {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div
      className={`auth-alert mb-6 rounded-2xl border p-4 ${
        isError ? 'auth-alert-error' : 'auth-alert-success'
      }`}
      role={isError ? 'alert' : 'status'}
    >
      {isError ? (
        <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <p className="text-sm leading-6">{message}</p>
    </div>
  );
}
