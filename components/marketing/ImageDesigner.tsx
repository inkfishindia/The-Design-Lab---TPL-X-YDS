import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { SparklesIcon } from '../icons/SparklesIcon';
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { UploadIcon } from '../icons/UploadIcon';
import { CloseIcon } from '../icons/CloseIcon';

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

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

const aspectRatios: AspectRatio[] = ["1:1", "4:3", "3:4", "16:9", "9:16"];

export const ImageDesigner: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  
  const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImageFile(file);
      setSourceImageUrl(URL.createObjectURL(file));
      setGeneratedImageUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setSourceImageFile(null);
    setSourceImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || isApiKeyMissing) {
      setError("Please provide a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      if (sourceImageFile && sourceImageUrl) {
        // --- EDITING LOGIC ---
        const base64Data = await blobToBase64(sourceImageFile);
        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: sourceImageFile.type,
          },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: { parts: [imagePart, textPart] },
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
        });

        const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePartFromResponse?.inlineData) {
          const base64ImageBytes = imagePartFromResponse.inlineData.data;
          const mimeType = imagePartFromResponse.inlineData.mimeType;
          const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
          setGeneratedImageUrl(imageUrl);
        } else {
          const textResponse = response.text || "The AI did not return an image. It might be due to a safety policy violation or an unclear prompt. Please try again.";
          setError(textResponse);
        }

      } else {
        // --- GENERATION LOGIC ---
        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
          },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
          const base64ImageBytes = response.generatedImages[0].image.imageBytes;
          const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
          setGeneratedImageUrl(imageUrl);
        } else {
          setError("The AI did not return an image. Please try a different prompt.");
        }
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to process image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const ApiKeyWarning = () => (
    isApiKeyMissing && (
      <div className="bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow px-4 py-3 rounded-lg my-4" role="alert">
        <p className="font-bold">API Key Missing</p>
        <p className="text-sm">Please configure your Gemini API Key in <strong>index.html</strong> to use this feature.</p>
      </div>
    )
  );

  const AspectRatioSelector: React.FC = () => (
    <div>
      <label className="block text-sm font-semibold text-text-muted mb-2">Aspect Ratio</label>
      <div className="flex flex-wrap gap-2">
        {aspectRatios.map(ratio => (
          <Button
            key={ratio}
            onClick={() => setAspectRatio(ratio)}
            variant={aspectRatio === ratio ? 'primary' : 'secondary'}
            size="sm"
            className="!font-mono"
          >
            {ratio}
          </Button>
        ))}
      </div>
    </div>
  );
  
  const ImageDisplay: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const imageUrlToShow = generatedImageUrl || sourceImageUrl;
    return (
      <div className="w-full bg-dark-bg/50 rounded-lg flex flex-col items-center justify-center p-4 min-h-[300px] aspect-square">
        <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-dark-border rounded-lg">
          {imageUrlToShow ? <img src={imageUrlToShow} alt="Image content" className="max-w-full max-h-full object-contain rounded-md" /> : children}
        </div>
      </div>
    );
  };
  
  const ImageUploader: React.FC = () => (
     <div className="space-y-2">
      <label className="block text-sm font-semibold text-text-muted">Upload Image to Edit (Optional)</label>
      {!sourceImageUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 bg-dark-surface hover:bg-dark-border border-2 border-dashed border-dark-border rounded-lg text-text-muted transition-colors">
          <UploadIcon className="w-5 h-5" />
          <span>Upload Image</span>
        </button>
      ) : (
        <div className="relative">
          <img src={sourceImageUrl} alt="Uploaded for editing" className="w-full h-auto rounded-lg max-h-40 object-contain bg-dark-bg/50 p-1" />
          <button onClick={handleRemoveImage} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70">
            <CloseIcon className="w-4 h-4"/>
          </button>
        </div>
      )}
      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
    </div>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-lg font-semibold text-text-light">Image Studio</h2>
        <p className="mt-1 text-sm text-text-muted">Generate visuals from text, or edit an existing image.</p>
      </div>
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <Textarea
              label="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={sourceImageFile ? "e.g., Make the cat wear sunglasses" : "e.g., A photorealistic image of a cat..."}
              rows={5}
            />
            <ImageUploader />
            {!sourceImageFile && <AspectRatioSelector />}
             <Button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim() || isApiKeyMissing}
              variant="creative"
              size="lg"
              className="w-full"
              leftIcon={<SparklesIcon className="w-5 h-5" />}
            >
              {isLoading ? 'Processing...' : (sourceImageFile ? 'Edit Image' : 'Generate Image')}
            </Button>
            <ApiKeyWarning />
          </div>

          <div className="flex justify-center items-start">
            <ImageDisplay>
              {isLoading && <p className="text-text-muted animate-pulse">Processing...</p>}
              {!isLoading && !generatedImageUrl && !sourceImageUrl && <div className="text-text-muted/50 text-center p-4">Your image will appear here</div>}
            </ImageDisplay>
          </div>
        </div>
         {error && <p className="text-center text-sm text-error-red mt-4">{error}</p>}
      </Card>
    </div>
  );
};
