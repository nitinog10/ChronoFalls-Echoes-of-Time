
import React from 'react';

interface ChoiceButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, onClick, disabled = false, title }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        w-full text-left px-4 py-3 my-1 rounded-lg transition-all duration-150 ease-in-out
        border border-indigo-500 hover:border-indigo-400
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75
        ${disabled
          ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-60'
          : 'bg-indigo-600 hover:bg-indigo-500 text-white active:bg-indigo-700'
        }
      `}
    >
      {text}
    </button>
  );
};

export default ChoiceButton;
    