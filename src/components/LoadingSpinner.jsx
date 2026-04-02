import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-primary text-sm">جاري التحميل...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
