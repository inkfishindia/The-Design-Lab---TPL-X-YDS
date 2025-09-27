import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon } from '../icons/SparklesIcon';
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

type BlogPost = {
  title: string;
  content: string;
  metaDescription: string;
};

export const BlogGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  const generateBlog = async () => {
    if (!topic.trim() || isApiKeyMissing) return;

    setIsLoading(true);
    setError(null);
    setBlogPost(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a comprehensive, engaging, and well-structured blog post about the following topic: "${topic}". The tone should be informative yet accessible. Include a catchy title and a concise, SEO-friendly meta description.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The catchy title of the blog post." },
              content: { type: Type.STRING, description: "The full content of the blog post, formatted with paragraphs." },
              metaDescription: { type: Type.STRING, description: "A concise, SEO-friendly meta description (max 160 characters)." }
            },
            required: ['title', 'content', 'metaDescription'],
          }
        }
      });
      const jsonStr = response.text.trim();
      const newPost = JSON.parse(jsonStr) as BlogPost;
      setBlogPost(newPost);
    } catch (e) {
      console.error(e);
      setError('Failed to generate blog post. Please check your API Key and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const ApiKeyWarning = () => (
    isApiKeyMissing && (
      <p className="text-xs text-warning-yellow mt-2 text-center">API Key missing. Please configure in index.html.</p>
    )
  );

  return (
    <Card>
      <h3 className="text-lg font-semibold text-midnight-navy text-center">Blog Post Generator</h3>
      <div className="mt-4">
        <Textarea
          id="blog-topic"
          label="Blog Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., The future of AI in content marketing..."
          rows={4}
        />
        <Button
          onClick={generateBlog}
          disabled={isLoading || !topic.trim() || isApiKeyMissing}
          className="mt-3 w-full"
          leftIcon={<SparklesIcon className="w-5 h-5" />}
        >
          {isLoading ? 'Generating...' : 'Generate Blog Post'}
        </Button>
        <ApiKeyWarning />
      </div>

      <div className="mt-6">
        {error && <p className="text-sm text-error-red">{error}</p>}
        {blogPost && (
          <div className="space-y-4 text-sm border-t border-midnight-navy/10 pt-4">
            <h4 className="text-xl font-bold text-midnight-navy">{blogPost.title}</h4>
            <div className="p-3 bg-cream rounded-md">
                <Badge color="orange">Meta Description</Badge>
                <p className="text-midnight-navy/80 italic text-xs mt-1">"{blogPost.metaDescription}"</p>
            </div>
            <div className="text-midnight-navy/90 whitespace-pre-wrap leading-relaxed">
              {blogPost.content}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};