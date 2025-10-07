import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, TokenResponse, PendingEvent, NotionTableData, ChatSession } from '../types';
import { createChatSession, generateStructuredContentFromText, generateChatTitleAndIcon } from '../services/geminiService';
import { createEvent, getEvents } from '../services/googleCalendarService';
import { getTasks } from '../services/googleTasksService';
import { searchEmails } from '../services/googleMailService';
import { searchFiles, getFileContent, createSheet, createDoc } from '../services/googleDriveService';
import { searchNotionPages, readNotionPageContent, queryNotionDatabase } from '../services/notionApiService';
import type { Chat as GeminiChat } from '@google/genai';
import { SendIcon } from './icons/SendIcon';
import { DriveIcon } from './icons/DriveIcon';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EventConfirmationCard } from './EventConfirmationCard';
import { NotionTable } from './NotionTable';
import { Input, Textarea } from './ui/Input';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';

import { ChatIcon } from './icons/ChatIcon';
import { StrategyIcon } from './icons/StrategyIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { CodeIcon } from './icons/CodeIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronDoubleLeftIcon } from './icons/ChevronDoubleLeftIcon';
import { ChevronDoubleRightIcon } from './icons/ChevronDoubleRightIcon';


interface AIStudioWidgetProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  onEventCreated?: () => void;
  onSignInRequest: () => void;
  primaryTaskListId: string | null;
}

const tableDataToCsv = (data: NotionTableData): string => {
    const escapeCell = (cell: string | null): string => {
      const str = cell === null ? '' : String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const headerRow = data.headers.map(escapeCell).join(',');
    const bodyRows = data.rows.map(row => row.map(escapeCell).join(','));
    return [headerRow, ...bodyRows].join('\n');
};

const SavableActions: React.FC<{
    part: { text?: string; table?: NotionTableData, title?: string };
    isAuthenticated: boolean;
    token: TokenResponse | null;
    onSignInRequest: () => void;
}> = ({ part, isAuthenticated, token, onSignInRequest }) => {
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [driveUrl, setDriveUrl] = useState<string | null>(null);
    const toast = useToast();

    const handleSave = async () => {
        if (!isAuthenticated || !token) {
            onSignInRequest();
            return;
        }

        setSaveState('saving');
        setDriveUrl(null);

        try {
            let file;
            if (part.table) {
                const csvContent = tableDataToCsv(part.table);
                file = await createSheet(part.title || 'Untitled Table', csvContent, token.access_token);
            } else if (part.text) {
                file = await createDoc(part.title || 'Untitled Document', part.text, token.access_token);
            } else {
                throw new Error("No content to save.");
            }
            
            if (file.webViewLink) {
                setDriveUrl(file.webViewLink);
            }
            setSaveState('success');
            toast.success("Successfully saved to Google Drive!");
        } catch (err) {
            console.error("Failed to save to Drive:", err);
            const msg = err instanceof Error ? err.message : 'An unknown error occurred.';
            toast.error(msg);
            setSaveState('error');
        }
    };
    
    const getButtonContent = () => {
        switch(saveState) {
            case 'saving': return 'Saving...';
            case 'success': return 'Saved!';
            case 'error': return 'Save Failed';
            default: return 'Save to Drive';
        }
    };

    return (
        <div className="mt-2 text-right">
            {saveState === 'success' && driveUrl ? (
                 <a 
                    href={driveUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-success-green hover:underline"
                >
                    <DriveIcon className="w-4 h-4" />
                    Open in Drive
                </a>
            ) : (
                <Button
                    onClick={handleSave}
                    disabled={saveState === 'saving' || saveState === 'success'}
                    variant="secondary"
                    size="sm"
                    leftIcon={<DriveIcon className="w-4 h-4" />}
                >
                    {getButtonContent()}
                </Button>
            )}
        </div>
    );
};

const ChatHistoryIcon: React.FC<{ iconName: string; className?: string }> = ({ iconName, className }) => {
    switch (iconName) {
        case 'planning': return <StrategyIcon className={className} />;
        case 'writing': return <EditIcon className={className} />;
        case 'analysis': return <DatabaseIcon className={className} />;
        case 'code': return <CodeIcon className={className} />;
        case 'design': return <SparklesIcon className={className} />;
        case 'chat':
        default: return <ChatIcon className={className} />;
    }
};


export const AIStudioWidget: React.FC<AIStudioWidgetProps> = ({ isAuthenticated, token, onEventCreated, onSignInRequest, primaryTaskListId }) => {
  const [mode, setMode] = useState<'chat' | 'process'>('chat');
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const [userInput, setUserInput] = useState('');
  const [processInput, setProcessInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<PendingEvent | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(() => {
    try {
        const savedState = localStorage.getItem('aiStudio_historyOpen');
        return savedState ? JSON.parse(savedState) : false;
    } catch {
        return false;
    }
  });
  
  const chatRef = useRef<GeminiChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  // Load from localStorage on mount
  useEffect(() => {
    try {
        const savedSessions = localStorage.getItem('aiStudio_sessions');
        const savedActiveId = localStorage.getItem('aiStudio_activeSessionId');
        if (savedSessions) {
            const parsedSessions = JSON.parse(savedSessions);
            if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
                setSessions(parsedSessions);
                const activeId = savedActiveId ? JSON.parse(savedActiveId) : parsedSessions[0].id;
                setActiveSessionId(parsedSessions.find(s => s.id === activeId) ? activeId : parsedSessions[0].id);
                return;
            }
        }
    } catch (e) { console.error("Failed to load chat history", e); }

    // If nothing loaded, create a default session
    const newSession: ChatSession = {
        id: Date.now().toString(),
        title: "New Chat",
        icon: "chat",
        messages: [{ role: 'model', parts: [{ text: "Hello! Switch to **Process** mode to summarize notes or get action items from text. Use **Chat** for conversational AI." }] }]
    };
    setSessions([newSession]);
    setActiveSessionId(newSession.id);
  }, []);

  // Save to localStorage when sessions change
  useEffect(() => {
    if (sessions.length > 0) localStorage.setItem('aiStudio_sessions', JSON.stringify(sessions));
    if (activeSessionId) localStorage.setItem('aiStudio_activeSessionId', JSON.stringify(activeSessionId));
  }, [sessions, activeSessionId]);

  useEffect(() => {
    localStorage.setItem('aiStudio_historyOpen', JSON.stringify(isHistoryOpen));
  }, [isHistoryOpen]);
  
  // Re-initialize gemini chat when active session or personality changes
  useEffect(() => {
    if (activeSession) {
      // Pass all but the very first placeholder message to the history
      const history = activeSession.messages.length > 1 ? activeSession.messages.slice(1) : [];
      chatRef.current = createChatSession(history);
    }
  }, [activeSessionId, sessions]);


  useEffect(() => {
    if (isAuthenticated && activeSessionId) {
        updateMessages(prev => {
            if (prev.find(m => m.parts[0]?.text?.includes("You're signed in!"))) return prev;
            return [...prev, { role: 'model', parts: [{ text: "You're signed in! Ask me to 'summarize your day', or ask me about your calendar, tasks, and files." }] }];
        });
        inputRef.current?.focus();
    }
  }, [isAuthenticated, activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, pendingEvent, isLoading]);
  
  useEffect(() => {
    if (editingSessionId) {
        editInputRef.current?.focus();
        editInputRef.current?.select();
    }
  }, [editingSessionId]);

  const updateMessages = (updater: (prevMessages: ChatMessage[]) => ChatMessage[], sessionId?: string) => {
    const targetSessionId = sessionId || activeSessionId;
    setSessions(prevSessions =>
        prevSessions.map(session =>
            session.id === targetSessionId
                ? { ...session, messages: updater(session.messages) }
                : session
        )
    );
  };
  
  const handleNewChat = () => {
    const newSession: ChatSession = {
        id: Date.now().toString(),
        title: "New Chat",
        icon: "chat",
        messages: [{ role: 'model', parts: [{ text: "I'm ready to help. What's on your mind?" }] }]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setUserInput('');
    setProcessInput('');
    setMode('chat');
  };

  const handleDeleteChat = (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    setSessions(prev => {
        const remaining = prev.filter(s => s.id !== sessionId);
        if (remaining.length === 0) {
            // This is tricky. handleNewChat updates state, which we are currently calculating.
            // Let's just create the new session directly.
            const newSession: ChatSession = {
                id: Date.now().toString(), title: "New Chat", icon: "chat",
                messages: [{ role: 'model', parts: [{ text: "I'm ready to help. What's on your mind?" }] }]
            };
            setActiveSessionId(newSession.id);
            return [newSession];
        }
        if (activeSessionId === sessionId) {
            setActiveSessionId(remaining[0].id);
        }
        return remaining;
    });
  };

  const handleStartRename = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleConfirmRename = () => {
    if (editingSessionId && editingTitle.trim()) {
      setSessions(prev => prev.map(s => s.id === editingSessionId ? { ...s, title: editingTitle.trim() } : s));
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const executeFunctionCall = async (functionCall: any): Promise<any> => {
    const { name, args } = functionCall;
    if (!isAuthenticated || !token) {
        if(!name.includes('Notion')) {
            onSignInRequest();
            throw new Error('User is not authenticated.');
        }
    }

    if (name.includes('Notion')) {
        const notionApiKey = process.env.NOTION_API_KEY;
        if (!notionApiKey || notionApiKey === 'YOUR_NOTION_API_KEY_HERE') {
            throw new Error('Please configure your Notion API Key in index.html to use Notion features.');
        }
        // FIX: The 'query' argument from the function call is of type 'unknown' and must be cast to a string.
        if (name === 'searchNotionPages') return { functionResponse: { name, response: { success: true, pages: await searchNotionPages(String(args.query)) } } };
        // FIX: The 'pageId' argument from the function call is of type 'unknown' and must be cast to a string.
        if (name === 'readNotionPageContent') return { functionResponse: { name, response: { success: true, content: await readNotionPageContent(String(args.pageId)) } } };
    }
    
    if (name === 'getDailyBriefing') {
        const today = new Date();
        const timeMin = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const timeMax = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        const [events, tasksData, emails] = await Promise.all([
            getEvents('primary', token!.access_token, timeMin, timeMax),
            primaryTaskListId ? getTasks(primaryTaskListId, token!.access_token) : Promise.resolve({ items: [] }),
            searchEmails(token!.access_token, 'is:unread in:inbox category:primary')
        ]);
        const tasks = tasksData.items?.map((t: any) => ({ title: t.title, status: t.status })) || [];
        return { functionResponse: { name, response: { success: true, events, tasks, emails } } };
    }
    // FIX: The 'timeMin' and 'timeMax' arguments are of type 'unknown' and must be safely cast to strings or passed as undefined.
    if (name === 'getCalendarEvents') return { functionResponse: { name, response: { success: true, events: await getEvents('primary', token!.access_token, args.timeMin ? String(args.timeMin) : undefined, args.timeMax ? String(args.timeMax) : undefined) } } };
    if (name === 'getTasks') {
        if (!primaryTaskListId) throw new Error("I can't find your primary task list.");
        const taskData = await getTasks(primaryTaskListId, token!.access_token);
        return { functionResponse: { name, response: { success: true, tasks: taskData.items?.map((t: any) => ({ title: t.title, status: t.status })) || [] } } };
    }
    // FIX: The 'query' argument from the function call is of type 'unknown' and must be cast to a string.
    if (name === 'searchEmails') return { functionResponse: { name, response: { success: true, emails: await searchEmails(token!.access_token, String(args.query)) } } };
    // FIX: The 'query' argument from the function call is of type 'unknown' and must be cast to a string.
    if (name === 'searchDriveFiles') return { functionResponse: { name, response: { success: true, files: await searchFiles(String(args.query), token!.access_token) } } };
    // FIX: The 'fileId' and 'mimeType' arguments are of type 'unknown' and must be cast to strings.
    if (name === 'readFileContent') return { functionResponse: { name, response: { success: true, content: await getFileContent(String(args.fileId), String(args.mimeType), token!.access_token) } } };
    if (name === 'readSheetData') {
        // FIX: Removed Google Sheets functionality
        throw new Error("Reading from Google Sheets is currently disabled.");
    }
    throw new Error(`Unknown function call: ${name}`);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: userInput }] };
    const shouldGenerateTitle = activeSession && activeSession.title === "New Chat";
    
    updateMessages(prev => [...prev, userMessage]);

    if (shouldGenerateTitle) {
      generateChatTitleAndIcon(userInput).then(({ title, icon }) => {
        setSessions(prev => prev.map(s => s.id === activeSessionId ? {...s, title, icon} : s));
      });
    }

    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
        let result = await chatRef.current.sendMessage({ message: currentInput });
        while(result.functionCalls) {
            const fc = result.functionCalls[0];
            if (fc.name === 'createCalendarEvent') {
                if (!isAuthenticated) {
                    onSignInRequest();
                    updateMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Please sign in first.'}] }]);
                } else setPendingEvent(fc.args as unknown as PendingEvent);
                return;
            } else if (fc.name === 'createTable') {
                // FIX: Type '{}' is missing the following properties from type 'string[]': length, pop, push, concat, and 28 more.
                // FIX: Type '{}' is missing the following properties from type 'string[][]': length, pop, push, concat, and 28 more.
                const tableData: NotionTableData = { headers: fc.args.headers as string[], rows: fc.args.rows as (string | null)[][] };
                // FIX: Use String() to safely handle the 'title' argument, which may be inferred as 'unknown'.
                // Using String() to safely cast the function call argument to a string, preventing type errors.
                updateMessages(prev => [...prev, { role: 'model', parts: [{ text: `Here is the table **${String(fc.args.title)}**:` }, { table: tableData, isSavable: true, title: String(fc.args.title) }] } as ChatMessage]);
                // FIX: Argument of type 'unknown' is not assignable to parameter of type 'string'.
                // Using String() to safely cast the function call argument to a string, preventing type errors.
                result = await chatRef.current.sendMessage({ message: [{ functionResponse: { name: 'createTable', response: { success: true, message: `Table '${String(fc.args.title)}' created.` } } }] });
            } else if (fc.name === 'readNotionDatabase') {
                // FIX: Argument of type 'unknown' is not assignable to parameter of type 'string'. Cast databaseId to string.
                const tableData = await queryNotionDatabase(String(fc.args.databaseId));
                if (tableData.rows.length > 0) updateMessages(prev => [...prev, { role: 'model', parts: [{ table: tableData }] }]);
                result = await chatRef.current.sendMessage({ message: [{ functionResponse: { name: 'readNotionDatabase', response: { success: true, message: `Database with ${tableData.rows.length} rows displayed.` } } }] });
            } else {
                const functionResponsePart = await executeFunctionCall(fc);
                result = await chatRef.current.sendMessage({ message: [functionResponsePart] });
            }
        }
        if (result.text) updateMessages(prev => [...prev, { role: 'model', parts: [{ text: result.text }] }]);
    } catch (error) {
        console.error('Error during chat:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        updateMessages(prev => [...prev, { role: 'model', parts: [{ text: `Sorry, there was an error: ${errorMessage}` }] }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleProcessRequest = async (action: 'table' | 'summary' | 'actions' | 'doc') => {
    if (!processInput.trim()) return;

    const userMessageText = `[Process Request: ${action}]\n\n"${processInput.substring(0, 100)}..."`;
    updateMessages(prev => [...prev, { role: 'user', parts: [{ text: userMessageText }] }]);
    setIsLoading(true);

    try {
      const result = await generateStructuredContentFromText(processInput, action);
      if (typeof result === 'string') {
        const titleMap = { summary: 'Summary', actions: 'Action Items', doc: 'Formatted Document' };
        updateMessages(prev => [...prev, { role: 'model', parts: [{ text: result, isSavable: true, title: titleMap[action] }] } as ChatMessage]);
      } else {
        updateMessages(prev => [...prev, { role: 'model', parts: [{ table: result, isSavable: true, title: result.title }] } as ChatMessage]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred.';
      updateMessages(prev => [...prev, { role: 'model', parts: [{ text: `Sorry, there was an error: ${msg}` }] }]);
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
      const result = await chatRef.current.sendMessage({ message: [{ functionResponse: { name: 'createCalendarEvent', response: { success: true, event: createdEvent } } }] });
      updateMessages(prev => [...prev, { role: 'model', parts: [{ text: result.text }] }]);
      onEventCreated?.();
    } catch (error) {
       console.error('Error creating event:', error);
       const result = await chatRef.current.sendMessage({ message: [{ functionResponse: { name: 'createCalendarEvent', response: { success: false, error: `Failed to create event: ${error instanceof Error ? error.message : 'Unknown'}` } } }] });
       updateMessages(prev => [...prev, { role: 'model', parts: [{ text: result.text }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEvent = () => {
    setPendingEvent(null);
    updateMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Okay, I have cancelled the event creation.' }] }]);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-dark-surface text-text-light">
        <div className={`flex-shrink-0 bg-dark-bg/50 border-r border-dark-border flex flex-col transition-all duration-300 ease-in-out ${isHistoryOpen ? 'w-64' : 'w-20'}`}>
            <div className={`p-2 border-b border-dark-border flex items-center ${isHistoryOpen ? 'justify-between' : 'justify-center'}`}>
                {isHistoryOpen && <h3 className="font-semibold px-2 text-sm">Chat History</h3>}
                <Button 
                    onClick={handleNewChat} 
                    variant="secondary" 
                    size="sm" 
                    className="!p-2"
                    title="New Chat"
                >
                    <PlusIcon className="w-4 h-4"/>
                </Button>
            </div>
            <div className="flex-grow overflow-y-auto p-2 space-y-1">
                {sessions.map(session => (
                    <div key={session.id} className={`group relative rounded-lg ${session.id === activeSessionId ? 'bg-accent-blue/10' : 'hover:bg-dark-border/50'}`}>
                        {editingSessionId === session.id && isHistoryOpen ? (
                            <Input
                                ref={editInputRef}
                                value={editingTitle}
                                onChange={e => setEditingTitle(e.target.value)}
                                onBlur={handleConfirmRename}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleConfirmRename();
                                    if (e.key === 'Escape') setEditingSessionId(null);
                                }}
                                className="!py-1.5 !px-2 !text-sm w-full"
                            />
                        ) : (
                             <button 
                                onClick={() => setActiveSessionId(session.id)} 
                                className={`w-full text-left font-medium text-text-light p-2.5 flex items-center gap-3 ${!isHistoryOpen && 'justify-center'}`}
                                title={session.title}
                            >
                                <ChatHistoryIcon iconName={session.icon || 'chat'} className="w-5 h-5 flex-shrink-0" />
                                {isHistoryOpen && <span className="truncate flex-grow">{session.title}</span>}
                            </button>
                        )}
                        {isHistoryOpen && editingSessionId !== session.id && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleStartRename(session)} className="p-1.5 text-text-muted hover:text-text-light hover:bg-black/10 rounded" title="Rename"><EditIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteChat(session.id)} className="p-1.5 text-text-muted hover:text-error-red hover:bg-error-red/10 rounded" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="p-2 border-t border-dark-border mt-auto">
                <Button 
                    onClick={() => setIsHistoryOpen(prev => !prev)} 
                    variant="secondary" 
                    size="sm" 
                    className={`w-full !px-2.5 ${isHistoryOpen ? '!justify-start' : '!justify-center'}`}
                    title={isHistoryOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {isHistoryOpen 
                        ? <><ChevronDoubleLeftIcon className="w-5 h-5 mr-2 flex-shrink-0" /><span>Collapse</span></>
                        : <ChevronDoubleRightIcon className="w-5 h-5" />
                    }
                </Button>
            </div>
        </div>
        <div className="flex flex-col flex-grow h-full">
            <div className="p-2 border-b border-dark-border flex justify-center bg-dark-bg/80">
                <div className="p-1 bg-dark-border/50 rounded-lg flex items-center gap-1">
                    <Button onClick={() => setMode('chat')} variant={mode === 'chat' ? 'primary' : 'secondary'} size="sm" className={mode === 'chat' ? '' : '!bg-transparent !text-text-muted'}>Chat</Button>
                    <Button onClick={() => setMode('process')} variant={mode === 'process' ? 'primary' : 'secondary'} size="sm" className={mode === 'process' ? '' : '!bg-transparent !text-text-muted'}>Process</Button>
                </div>
            </div>

            <div className="flex-grow p-6 overflow-y-auto space-y-6">
                {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                    className={`max-w-xl lg:max-w-3xl px-5 py-3 rounded-2xl whitespace-pre-wrap text-sm shadow-sm leading-relaxed ${
                        msg.role === 'user' ? 'bg-accent-orange text-white rounded-br-none' : 'bg-dark-bg text-text-light rounded-bl-none'
                    }`}
                    >
                    <div className="space-y-2">
                        {msg.parts.map((part, partIndex) => (
                            <div key={partIndex}>
                                {part.text && <div dangerouslySetInnerHTML={{ __html: part.text?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '' }} />}
                                {part.table && <NotionTable data={part.table} />}
                                {part.isSavable && <SavableActions part={part} isAuthenticated={isAuthenticated} token={token} onSignInRequest={onSignInRequest} />}
                            </div>
                        ))}
                    </div>
                    </div>
                </div>
                ))}
                {pendingEvent && <EventConfirmationCard event={pendingEvent} onConfirm={handleConfirmEvent} onCancel={handleCancelEvent} />}
                {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-dark-bg px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-text-muted/40 rounded-full animate-pulse delay-75"></span>
                        <span className="w-2 h-2 bg-text-muted/40 rounded-full animate-pulse delay-150"></span>
                        <span className="w-2 h-2 bg-text-muted/40 rounded-full animate-pulse delay-300"></span>
                    </div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-dark-border bg-dark-surface">
                {mode === 'chat' ? (
                    <form onSubmit={handleSendMessage} className="relative">
                        <Textarea ref={inputRef} rows={1} value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={isAuthenticated ? "Ask me anything..." : "Sign in to get started..."} disabled={isLoading || pendingEvent !== null} className="!rounded-full !py-3 !pr-14 !pl-5" />
                        <Button type="submit" disabled={isLoading || !userInput.trim() || pendingEvent !== null} className="!absolute !right-1.5 !top-1/2 !-translate-y-1/2 !w-10 !h-10 !p-2 !rounded-full" variant="creative"><SendIcon className="w-5 h-5" /></Button>
                    </form>
                ) : (
                    <div className="space-y-3">
                        <Textarea value={processInput} onChange={(e) => setProcessInput(e.target.value)} placeholder="Paste meeting notes, articles, or any unstructured text..." rows={4} />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button onClick={() => handleProcessRequest('summary')} disabled={isLoading || !processInput.trim()} size="sm" variant="secondary">Summarize</Button>
                            <Button onClick={() => handleProcessRequest('table')} disabled={isLoading || !processInput.trim()} size="sm" variant="secondary">To Table</Button>
                            <Button onClick={() => handleProcessRequest('actions')} disabled={isLoading || !processInput.trim()} size="sm" variant="secondary">Get Actions</Button>
                            <Button onClick={() => handleProcessRequest('doc')} disabled={isLoading || !processInput.trim()} size="sm" variant="secondary">Format Doc</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
