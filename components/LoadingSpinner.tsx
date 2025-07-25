
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="ml-2 text-indigo-400">Echo is thinking...</p>
    </div>
  );
};

export default LoadingSpinner;
    