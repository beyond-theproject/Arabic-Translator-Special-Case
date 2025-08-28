import React from 'react';
import type { WordTranslation } from '../types';

interface TranslationDisplayProps {
  translations: WordTranslation[];
}

// Sub-component for rendering the Arabic word with its confidence indicator
const ArabicWord: React.FC<{ item: WordTranslation }> = ({ item }) => {
  const { arabic, confidence } = item;
  // Show indicator if confidence score exists and is below 95%
  const showConfidence = typeof confidence === 'number' && confidence < 0.95;

  const getConfidenceIndicator = () => {
    if (!showConfidence) return null;

    let colorClass = '';
    // Yellow for medium confidence (80% - 94%)
    if (confidence >= 0.8) {
      colorClass = 'text-yellow-500';
    // Red for low confidence (< 80%)
    } else {
      colorClass = 'text-red-500';
    }
    
    // Using a dot character as a visual marker
    return <span className={`ml-1 text-xs ${colorClass}`}>●</span>;
  };

  return (
    <div className="relative group inline-flex items-center align-middle">
      {/* Render the Arabic word with colored harakat from the API response */}
      <span dangerouslySetInnerHTML={{ __html: arabic }} />
      {getConfidenceIndicator()}
      {/* Tooltip to show exact OCR accuracy */}
      {showConfidence && (
         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-2 py-1 
                       bg-gray-800 text-white text-xs font-sans rounded-md shadow-lg 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            Akurasi OCR: {Math.round(confidence * 100)}%
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
                             border-x-4 border-x-transparent 
                             border-t-4 border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};


// Main component for displaying the translation results
const TranslationDisplay: React.FC<TranslationDisplayProps> = ({ translations }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-teal-600 dark:text-teal-400">Hasil Terjemahan</h2>
      
      {/* Card-based layout for small screens (<md) */}
      <div className="flex flex-col gap-4 md:hidden">
        {translations.map((item, index) => (
          <div key={`${item.arabic}-${index}`} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow-sm border dark:border-gray-600">
            <div className="flex justify-between items-center pb-2 border-b dark:border-gray-600">
              <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Kata Arab</span>
              <div className="font-amiri text-2xl text-gray-900 dark:text-white">
                <ArabicWord item={item} />
              </div>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Pelafalan</span>
              <span className="italic text-gray-600 dark:text-gray-300">{item.pronunciation}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Terjemahan Per Kata</span>
              <span className="text-gray-800 dark:text-gray-200 text-right">{item.translation}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Table layout for medium screens and larger (md:) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th scope="col" className="px-6 py-3 text-right">
                Kata Arab
              </th>
              <th scope="col" className="px-6 py-3">
                Pelafalan
              </th>
              <th scope="col" className="px-6 py-3">
                Terjemahan Per Kata
              </th>
            </tr>
          </thead>
          <tbody>
            {translations.map((item, index) => (
              <tr key={`${item.arabic}-${index}`} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                <td className="px-6 py-4 font-amiri text-2xl text-gray-900 dark:text-white text-right">
                  <ArabicWord item={item} />
                </td>
                <td className="px-6 py-4 italic">
                  {item.pronunciation}
                </td>
                <td className="px-6 py-4">
                  {item.translation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TranslationDisplay;
