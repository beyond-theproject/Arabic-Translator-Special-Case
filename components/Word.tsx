
import React from 'react';

interface WordProps {
  arabic: string;
  translation: string;
  confidence?: number;
}

const Word: React.FC<WordProps> = ({ arabic, translation, confidence }) => {
  // Hanya tampilkan skor jika ada dan di bawah 100%
  const showConfidence = typeof confidence === 'number' && confidence < 1.0;

  const getConfidenceClass = () => {
    if (typeof confidence !== 'number' || confidence >= 0.9) return '';
    if (confidence >= 0.7) return 'border-b-2 border-yellow-500';
    return 'border-b-2 border-red-500';
  };

  return (
    <span className="relative group inline-block cursor-pointer">
      <span className={`transition-colors duration-300 group-hover:bg-teal-100 dark:group-hover:bg-teal-800/50 px-1 rounded-md ${getConfidenceClass()}`}>
        {arabic}
      </span>
      <span 
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 
                   bg-gray-800 dark:bg-gray-900 text-white text-sm font-sans rounded-md shadow-lg 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
      >
        <span className="font-semibold">{translation}</span>
        {showConfidence && (
          <span className="block text-xs text-gray-400 mt-1">
            Akurasi OCR: {Math.round(confidence * 100)}%
          </span>
        )}
        <span 
          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
                     border-x-4 border-x-transparent 
                     border-t-4 border-t-gray-800 dark:border-t-gray-900"
        ></span>
      </span>
    </span>
  );
};

export default Word;
