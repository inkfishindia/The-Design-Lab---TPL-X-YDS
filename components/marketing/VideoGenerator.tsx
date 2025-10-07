import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { SparklesIcon } from '../icons/SparklesIcon';
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

export const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImageUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || isApiKeyMissing) {
            setError("A text prompt is required.");
            return;
        }

        setIsLoading(true);
        setVideoUrl(null);
        setError(null);
        
        try {
            setLoadingMessage('Initializing video generation...');
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const generationParams: {
                model: string;
                prompt: string;
                image?: { imageBytes: string; mimeType: string; };
                config: { numberOfVideos: number };
            } = {
                model: 'veo-2.0-generate-001',
                prompt,
                config: { numberOfVideos: 1 }
            };

            if (imageFile) {
                const base64Data = await blobToBase64(imageFile);
                generationParams.image = {
                    imageBytes: base64Data,
                    mimeType: imageFile.type,
                };
            }

            let operation = await ai.models.generateVideos(generationParams);
            setLoadingMessage('AI is processing frames... this may take a few minutes.');

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10s
                operation = await ai.operations.getVideosOperation({ operation });
            }

            setLoadingMessage('Finalizing video...');
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

            if (!downloadLink) {
                // FIX: Argument of type 'unknown' is not assignable to parameter of type 'string'.
                const failureReason = String(operation.error?.message || "Video generation finished, but no download link was provided.");
                throw new Error(failureReason);
            }

            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) {
                throw new Error(`Failed to download video: ${videoResponse.statusText}`);
            }

            const videoBlob = await videoResponse.blob();
            const url = URL.createObjectURL(videoBlob);
            setVideoUrl(url);

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const ApiKeyWarning = () => (
        isApiKeyMissing && (
            <div className="bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow px-4 py-3 rounded-lg my-4 text-center" role="alert">
                <p className="font-bold">API Key Missing</p>
                <p className="text-sm">Please configure your Gemini API Key in <strong>index.html</strong> to use this feature.</p>
            </div>
        )
    );

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-text-light">Video Studio</h2>
                <p className="mt-1 text-sm text-text-muted">Generate short videos from a text prompt and an optional image.</p>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                         <Textarea
                            label="Prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A cinematic shot of a futuristic city at sunset..."
                            rows={5}
                        />
                        <div className="space-y-2">
                             <label className="block text-sm font-semibold text-text-muted">Optional Image</label>
                            {!imageUrl ? (
                                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 bg-dark-surface hover:bg-dark-border border-2 border-dashed border-dark-border rounded-lg text-text-muted transition-colors">
                                    <UploadIcon className="w-5 h-5" />
                                    <span>Upload Seed Image</span>
                                </button>
                            ) : (
                                <div className="relative">
                                    <img src={imageUrl} alt="Seed" className="w-full h-auto rounded-lg" />
                                    <button onClick={handleRemoveImage} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70">
                                        <CloseIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            )}
                             <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt.trim() || isApiKeyMissing}
                            variant="creative"
                            className="w-full"
                            leftIcon={<SparklesIcon className="w-5 h-5" />}
                        >
                            {isLoading ? 'Generating...' : 'Generate Video'}
                        </Button>
                        <ApiKeyWarning />
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-dark-bg/50 rounded-lg p-4 min-h-[300px]">
                        {isLoading && (
                            <div className="text-center">
                                <p className="text-text-muted animate-pulse">Generating Video</p>
                                <p className="mt-2 text-sm text-text-muted/80">{loadingMessage}</p>
                            </div>
                        )}
                        {error && <p className="text-center text-error-red">{error}</p>}
                        {videoUrl && (
                            <video src={videoUrl} controls autoPlay loop className="w-full h-auto rounded-md" />
                        )}
                        {!isLoading && !videoUrl && !error && (
                             <p className="text-center text-text-muted">Your generated video will appear here.</p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};