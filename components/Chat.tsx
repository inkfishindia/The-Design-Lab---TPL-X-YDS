import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, TokenResponse, PendingEvent } from '../types';
import { createChatSession } from '../services/geminiService';
import { createEvent, getEvents } from '../services/googleCalendarService';
import { getTasks } from '../services/googleTasksService';
import { searchEmails } from '../services/googleMailService';
import { searchFiles, getFileContent } from '../services/googleDriveService';
import { readSheetData } from '../services/googleSheetsService';
import type { Chat as GeminiChat } from '@google/genai';
import { SendIcon } from './icons/SendIcon';
import { EventConfirmationCard } from './EventConfirmationCard';
import { Textarea } from './ui/Input';
import { Button } from './ui/Button';

interface ChatProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  onEventCreated: () => void;
  onSignInRequest: () => void;
  primaryTaskListId: string | null;
}

export const Chat: React.FC<ChatProps> = ({ isAuthenticated, token, onEventCreated, onSignInRequest, primaryTaskListId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<PendingEvent | null>(null);
  const chatRef = useRef<GeminiChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatRef.current = createChatSession();
    setMessages([{ role: 'model', parts: [{ text: "Hello! I can help you manage your schedule and information across your Google account. Sign in to get started." }] }]);
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: "You're signed in! Ask me to 'summarize your day', or ask me about your calendar, tasks, and files." }] }]);
        inputRef.current?.focus();
    }
  }, [isAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, pendingEvent, isLoading]);

  const executeFunctionCall = async (functionCall: any): Promise<any> => {
    if (!isAuthenticated || !token) {
        onSignInRequest();
        throw new Error('User is not authenticated.');
    }
    
    const { name, args } = functionCall;

    if (name === 'getDailyBriefing') {
        const today = new Date();
        const timeMin = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const timeMax = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    
        const [events, tasksData, emails] = await Promise.all([
            getEvents(token.access_token, timeMin, timeMax),
            primaryTaskListId ? getTasks(primaryTaskListId, token.access_token) : Promise.resolve({ items: [] }),
            searchEmails(token.access_token, 'is:unread in:inbox category:primary')
        ]);
    
        const tasks = tasksData.items?.map((t: any) => ({ title: t.title, status: t.status })) || [];
        
        return { functionResponse: { name, response: { success: true, events, tasks, emails } } };
    }

    if (name === 'getCalendarEvents') {
        const { timeMin, timeMax } = args;
        const events = await getEvents(token.access_token, timeMin, timeMax);
        return { functionResponse: { name, response: { success: true, events } } };
    }
    
    if (name === 'getTasks') {
        if (!primaryTaskListId) {
            throw new Error("I can't find your primary task list.");
        }
        const taskData = await getTasks(primaryTaskListId, token.access_token);
        const tasks = taskData.items?.map((t: any) => ({ title: t.title, status: t.status })) || [];
        return { functionResponse: { name, response: { success: true, tasks } } };
    }

    if (name === 'searchEmails') {
        const emails = await searchEmails(token.access_token, args.query);
        return { functionResponse: { name, response: { success: true, emails } } };
    }

    if (name === 'searchDriveFiles') {
        const files = await searchFiles(args.query, token.access_token);
        return { functionResponse: { name, response: { success: true, files } } };
    }

    if (name === 'readFileContent') {
        const { fileId, mimeType } = args;
        const content = await getFileContent(fileId, mimeType, token.access_token);
        return { functionResponse: { name, response: { success: true, content } } };
    }

    if (name === 'readSheetData') {
        const { spreadsheetId, range } = args;
        if (!spreadsheetId || !range) {
            throw new Error("Spreadsheet ID and range are required to read a sheet.");
        }
        const data = await readSheetData(spreadsheetId, range, token.access_token);
        return { functionResponse: { name, response: { success: true, data } } };
    }

    throw new Error(`Unknown function call: ${name}`);
  };


  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: userInput }] };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
        let result = await chatRef.current.sendMessage({ message: currentInput });

        while(result.functionCalls) {
            const functionCall = result.functionCalls[0];

            if (functionCall.name === 'createCalendarEvent') {
                if (!isAuthenticated) {
                    onSignInRequest();
                    setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Please sign in first.'}] }]);
                } else {
                    setPendingEvent(functionCall.args as unknown as PendingEvent);
                }
                return;
            } else {
                const functionResponsePart = await executeFunctionCall(functionCall);
                result = await chatRef.current.sendMessage({ message: [functionResponsePart] });
            }
        }

        setMessages(prev => [...prev, { role: 'model', parts: [{ text: result.text }] }]);

    } catch (error) {
        console.error('Error during chat:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Sorry, there was an error: ${errorMessage}` }] }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleConfirmEvent = async () => {
    if (!pendingEvent || !token || !chatRef.current) return;
    
    setIsLoading(true);
    const eventToCreate = { ...pendingEvent };
    setPendingEvent(null);

    try {
      const createdEvent = await createEvent(eventToCreate, token.access_token);
      
      const functionResponsePart = {
        functionResponse: {
          name: 'createCalendarEvent',
          response: { success: true, event: createdEvent },
        },
      };

      const result = await chatRef.current.sendMessage({ message: [functionResponsePart] });
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: result.text }] }]);
      onEventCreated();

    } catch (error) {
       console.error('Error creating event:', error);
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       const functionResponsePart = {
          functionResponse: {
            name: 'createCalendarEvent',
            response: { success: false, error: `Failed to create event: ${errorMessage}` },
          },
       };
       const result = await chatRef.current.sendMessage({ message: [functionResponsePart] });
       setMessages(prev => [...prev, { role: 'model', parts: [{ text: result.text }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEvent = () => {
    setPendingEvent(null);
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Okay, I have cancelled the event creation.' }] }]);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xl lg:max-w-2xl px-4 py-2 rounded-xl whitespace-pre-wrap text-sm ${
                msg.role === 'user' ? 'bg-midnight-navy text-cream rounded-br-none' : 'bg-midnight-navy/10 text-midnight-navy rounded-bl-none'
              }`}
            >
              {msg.parts[0].text}
            </div>
          </div>
        ))}

        {pendingEvent && <EventConfirmationCard event={pendingEvent} onConfirm={handleConfirmEvent} onCancel={handleCancelEvent} />}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-midnight-navy/10 px-4 py-3 rounded-xl rounded-bl-none">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-midnight-navy/40 rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-midnight-navy/40 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-midnight-navy/40 rounded-full animate-pulse delay-300"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-midnight-navy/10">
        <div className="relative">
          <Textarea
            ref={inputRef}
            rows={1}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAuthenticated ? "Ask me anything, or press Shift + Enter for a new line..." : "Sign in to get started..."}
            disabled={isLoading || pendingEvent !== null}
            className="w-full !rounded-full !bg-white !border !border-midnight-navy/20 !py-3 !pr-12 !pl-4 focus:!border-transparent focus:!ring-2 focus:!ring-heritage-blue transition-all max-h-48"
          />
          <Button
            type="submit"
            disabled={isLoading || !userInput.trim() || pendingEvent !== null}
            className="!absolute !right-1.5 !top-1/2 !-translate-y-1/2 !p-2 !rounded-full"
            size="sm"
          >
            <SendIcon className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};