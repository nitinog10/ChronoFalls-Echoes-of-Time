
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface EchoDialogProps {
  message: string;
  isThinking: boolean;
  onConsultEcho: () => void;
  canConsult: boolean;
}

const EchoDialog: React.FC<EchoDialogProps> = ({ message, isThinking, onConsultEcho, canConsult }) => {
  return (
    <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-xl border border-indigo-700 min-h-[120px] flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-indigo-400 mb-2">Echo's Guidance</h3>
        {isThinking ? (
          <LoadingSpinner />
        ) : (
          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{message}</p>
        )}
      </div>
      {canConsult && (
         <button 
            onClick={onConsultEcho}
            disabled={isThinking}
            className="mt-4 self-start px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
           Consult Echo...
         </button>
      )}
    </div>
  );
};

export default EchoDialog;
    