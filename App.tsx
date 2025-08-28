import React, { useState, useCallback } from 'react';
import type { WordTranslation } from './types';
import { translateWordByWord, translateImageWordByWord } from './services/geminiService';
import InputArea, { type TranslatePayload } from './components/InputArea';
import TranslationDisplay from './components/TranslationDisplay';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [translations, setTranslations] = useState<WordTranslation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = useCallback(async (payload: TranslatePayload) => {
    setIsLoading(true);
    setError(null);
    setTranslations([]);

    try {
      let result: WordTranslation[];
      if (payload.type === 'text') {
        if (!payload.value.trim()) {
          setError("Silakan masukkan teks Arab untuk diterjemahkan.");
          setIsLoading(false);
          return;
        }
        result = await translateWordByWord(payload.value);
      } else { // type is 'image'
        result = await translateImageWordByWord(payload.value.data, payload.value.mimeType);
      }
      setTranslations(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Terjadi kesalahan yang tidak diketahui.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-600 dark:text-teal-400">
            Penerjemah Kitab Arab
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Terjemahan Kata per Kata dengan Bantuan AI
          </p>
        </header>
        
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <InputArea onTranslate={handleTranslate} isLoading={isLoading} />
        </div>

        <div className="w-full max-w-3xl mt-8">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {translations.length > 0 && !isLoading && (
            <TranslationDisplay translations={translations} />
          )}
          {!isLoading && !error && translations.length === 0 && <InitialStateMessage />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
    <svg className="animate-spin h-10 w-10 text-teal-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Menerjemahkan...</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">AI sedang memproses teks Anda.</p>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg shadow" role="alert">
    <p className="font-bold">Error</p>
    <p>{message}</p>
  </div>
);

const InitialStateMessage: React.FC = () => (
    <div className="text-center p-8 bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-gray-500 dark:text-gray-400">
            Hasil terjemahan akan muncul di sini.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Masukkan teks atau unggah gambar di atas dan klik tombol "Terjemahkan".
        </p>
    </div>
);


export default App;