
import React, { useState, useCallback, ChangeEvent } from 'react';

type InputMode = 'text' | 'image';

interface TextPayload {
  type: 'text';
  value: string;
}

interface ImagePayload {
  type: 'image';
  value: {
    data: string; // base64
    mimeType: string;
  };
}

export type TranslatePayload = TextPayload | ImagePayload;

interface InputAreaProps {
  onTranslate: (payload: TranslatePayload) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onTranslate, isLoading }) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File | null | undefined) => {
    if (file && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        console.warn("Unsupported file type selected.");
    }
  }, []);

  const handleImageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
  }, [processFile]);
  
  const handleRemoveImage = useCallback(() => {
      setImageFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) {
          fileInput.value = '';
      }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (mode === 'text') {
      if (!text.trim()) return;
      onTranslate({ type: 'text', value: text });
    } else if (mode === 'image' && imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        if (base64String) {
          onTranslate({ type: 'image', value: { data: base64String, mimeType: imageFile.type } });
        }
      };
      reader.readAsDataURL(imageFile);
    }
  }, [isLoading, mode, text, imageFile, onTranslate]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  }, [isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [isLoading, processFile]);
  
  const isSubmitDisabled = isLoading || (mode === 'text' && !text.trim()) || (mode === 'image' && !imageFile);

  return (
    <>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <TabButton name="Teks" mode="text" activeMode={mode} setMode={setMode} />
        <TabButton name="Gambar" mode="image" activeMode={mode} setMode={setMode} />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'text' ? (
          <TextArea text={text} setText={setText} isLoading={isLoading} />
        ) : (
          <ImageUploadArea
            imagePreview={imagePreview}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            isLoading={isLoading}
            isDragging={isDragging}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
          />
        )}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/50 dark:focus:ring-teal-400/50 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            <LoadingIcon />
          ) : (
            <>
              <TranslateIcon />
              <span>Terjemahkan</span>
            </>
          )}
        </button>
      </form>
    </>
  );
};

const TabButton: React.FC<{ name: string, mode: InputMode, activeMode: InputMode, setMode: (mode: InputMode) => void }> = ({ name, mode, activeMode, setMode }) => (
    <button
        type="button"
        onClick={() => setMode(mode)}
        className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors duration-200 ${
            activeMode === mode
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
    >
        {name}
    </button>
);

const TextArea: React.FC<{ text: string, setText: (text: string) => void, isLoading: boolean }> = ({ text, setText, isLoading }) => (
    <>
        <label htmlFor="arabic-text" className="sr-only">Teks Arab</label>
        <textarea
            id="arabic-text"
            dir="rtl"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="...اكتب النص العربي هنا"
            className="w-full h-40 p-4 text-xl font-amiri bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 dark:focus:border-teal-400 transition-colors duration-200 text-right resize-y"
            disabled={isLoading}
        />
    </>
);

const ImageUploadArea: React.FC<{
  imagePreview: string | null,
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void,
  handleRemoveImage: () => void,
  isLoading: boolean,
  isDragging: boolean,
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void,
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void,
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
}> = ({ imagePreview, handleImageChange, handleRemoveImage, isLoading, isDragging, handleDragOver, handleDragLeave, handleDrop }) => (
    <div
      className="w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
        <label htmlFor="image-upload" className="sr-only">Unggah Gambar</label>
        {imagePreview ? (
            <div className="relative group">
                <img src={imagePreview} alt="Pratinjau" className="w-full h-auto max-h-60 object-contain rounded-lg border-2 border-gray-300 dark:border-gray-600" />
                <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    aria-label="Hapus gambar"
                    disabled={isLoading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        ) : (
            <div className="flex items-center justify-center w-full">
                <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors duration-200 ${
                        isLoading ? 'cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800' : 'cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-600'
                    } ${
                        isDragging ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/50' : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Klik atau seret gambar</span></p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, atau WEBP</p>
                    </div>
                    <input id="image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" disabled={isLoading} />
                </label>
            </div>
        )}
    </div>
);

const LoadingIcon = () => (
    <>
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Memproses...</span>
    </>
);

const TranslateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m4 13-4-4m0 0l4-4m-4 4h12M3 17h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


export default InputArea;
