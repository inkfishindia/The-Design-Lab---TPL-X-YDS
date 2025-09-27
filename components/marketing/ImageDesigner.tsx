import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { UploadIcon } from '../icons/UploadIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const ImageDesigner: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImageFile(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setGeneratedImageUrl(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!originalImageFile || !prompt.trim() || isApiKeyMissing) {
      setError("Please provide an image and a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    setGeneratedText(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = await blobToBase64(originalImageFile);
      
      const imagePart = {
        inlineData: { data: base64Data, mimeType: originalImageFile.type },
      };
      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          setGeneratedText(part.text);
        } else if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          setGeneratedImageUrl(imageUrl);
          foundImage = true;
        }
      }
      if (!foundImage) {
        setError("The AI did not return an image. It might have responded with text only.");
      }

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const ApiKeyWarning = () => (
    isApiKeyMissing && (
      <div className="bg-warning-yellow/10 border border-warning-yellow/20 text-yellow-700 px-4 py-3 rounded-lg my-4" role="alert">
        <p className="font-bold">API Key Missing</p>
        <p className="text-sm">Please configure your Gemini API Key in <strong>index.html</strong> to use this feature.</p>
      </div>
    )
  );
  
  const ImageDisplay: React.FC<{ src: string | null; title: string; children?: React.ReactNode }> = ({ src, title, children }) => (
    <div className="flex-1 bg-heritage-blue/5 rounded-lg flex flex-col items-center justify-center p-4 min-h-[300px]">
      <h4 className="text-sm font-semibold text-midnight-navy/60 uppercase tracking-wider mb-4">{title}</h4>
      <div className="w-full h-full aspect-square flex items-center justify-center border-2 border-dashed border-midnight-navy/20 rounded-lg">
        {src ? <img src={src} alt={title} className="max-w-full max-h-full object-contain rounded-md" /> : children}
      </div>
    </div>
  );

  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-cream">Graphic Designer Hub</h2>
        <p className="mt-2 text-lg text-cream/70">Edit images with AI. Upload an image, provide instructions, and see the result.</p>
      </div>
      
      <Card className="mt-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-4 bg-cream hover:bg-midnight-navy/5 border-2 border-dashed border-midnight-navy/20 rounded-lg text-midnight-navy/80 transition-colors">
              <UploadIcon className="w-6 h-6" />
              <span>{originalImageFile ? 'Change Image' : 'Click to Upload Image'}</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your edits... e.g., 'add a birthday hat on the cat', 'make the background a cyberpunk city'"
              rows={4}
            />
             <Button
              onClick={handleGenerate}
              disabled={isLoading || !originalImageFile || !prompt.trim() || isApiKeyMissing}
              className="w-full"
              leftIcon={<SparklesIcon className="w-5 h-5" />}
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
            </Button>
            <ApiKeyWarning />
          </div>

          <div className="flex gap-4">
            <ImageDisplay src={originalImageUrl} title="Original" />
            <ImageDisplay src={generatedImageUrl} title="Generated">
              {isLoading && <p className="text-midnight-navy/70 animate-pulse">Generating...</p>}
              {!isLoading && !generatedImageUrl && <div className="text-midnight-navy/50 text-center p-4">AI result will appear here</div>}
            </ImageDisplay>
          </div>
        </div>
         {error && <p className="text-center text-sm text-error-red mt-4">{error}</p>}
         {generatedText && <p className="text-center text-sm text-midnight-navy/70 italic mt-4">AI Response: "{generatedText}"</p>}
      </Card>
    </div>
  );
};