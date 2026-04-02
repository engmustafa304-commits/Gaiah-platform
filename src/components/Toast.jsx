import React from 'react';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[toast.type] || 'bg-primary';

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
        <span className="text-sm">{toast.message}</span>
        <button onClick={onClose} className="hover:opacity-80">✕</button>
      </div>
    </div>
  );
};

export default Toast;
