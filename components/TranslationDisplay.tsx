import React from 'react';
import type { WordTranslation } from '../types';

interface TranslationDisplayProps {
  translations: WordTranslation[];
}

const ArabicWord: React.FC<{ item: WordTranslation }> = ({ item }) => {
  const { arabic, confidence } = item;
  // Tampilkan indikator jika skor keyakinan ada dan di bawah 95%
  const showConfidence = typeof confidence === 'number' && confidence < 0.95;

  const getConfidenceIndicator = () => {
    if (!showConfidence) return null;

    let colorClass = '';
    // Kuning untuk keyakinan sedang (80% - 94%)
    if (confidence >= 0.8) {
      colorClass = 'text-yellow-500';
    // Merah untuk keyakinan rendah (< 80%)
    } else {
      colorClass = 'text-red-500';
    }
    
    // Menggunakan karakter titik sebagai penanda visual
    return <span className={`ml-1 text-xs ${colorClass}`}>●</span>;
  };

  return (
    <div className="relative group inline-flex items-center align-middle">
      <span dangerouslySetInnerHTML={{ __html: arabic }} />
      {getConfidenceIndicator()}
      {showConfidence && (
         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-2 py-1 
                       bg-gray-800 text-white text-xs font-sans rounded-md shadow-lg 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            Akurasi OCR: {Math.round(confidence * 100)}%
            <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
                             border-x-4 border-x-transparent 
                             border-t-4 border-t-gray-800"></span>
        </div>
      )}
    </div>
  );
};


const TranslationDisplay: React.FC<TranslationDisplayProps> = ({ translations }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-teal-600 dark:text-teal-400">Hasil Terjemahan</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
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