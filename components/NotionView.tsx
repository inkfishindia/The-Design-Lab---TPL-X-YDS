import React, { useState, useEffect } from 'react';
import { searchNotionPages, readNotionPageContent, queryNotionDatabase, getNotionDatabases } from '../services/notionApiService';
import type { NotionPage, NotionTableData } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { NotionIcon } from './icons/NotionIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { NotionTable } from './NotionTable';
import { WidgetCard } from './ui/WidgetCard';
import { VerticalSplitter } from './ui/Splitter';

const ApiKeyWarning = ({ isApiKeyMissing }: { isApiKeyMissing: boolean }) => (
    isApiKeyMissing && (
        <div className="bg-warning-yellow/10 border border-warning-yellow/20 text-yellow-700 px-4 py-3 rounded-lg my-4" role="alert">
            <p className="font-bold">Notion API Key Missing</p>
            <p className="text-sm">Please configure your Notion API Key in <strong>index.html</strong> to use this feature.</p>
        </div>
    )
);

const PageItem: React.FC<{ page: NotionPage, onClick: () => void }> = ({ page, onClick }) => {
    const getIcon = () => {
        if (page.object === 'database') return <DatabaseIcon className="w-5 h-5 text-midnight-navy/60" />;
        if (!page.icon) return <NotionIcon className="w-5 h-5 text-midnight-navy/60" />;
        if (page.icon.type === 'emoji') return <span>{page.icon.emoji}</span>;
        if (page.icon.type === 'file' && page.icon.file) return <img src={page.icon.file.url} alt="icon" className="w-5 h-5 rounded-sm" />;
        return <NotionIcon className="w-5 h-5 text-midnight-navy/60" />;
    };

    return (
        <div onClick={onClick} className="flex items-center gap-3 p-2 rounded-md hover:bg-heritage-blue/10 cursor-pointer">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="flex-grow">
                <p className="text-sm font-medium text-midnight-navy truncate">{page.title}</p>
                <a href={page.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-heritage-blue hover:underline truncate block">
                    {page.url}
                </a>
            </div>
        </div>
    );
};

export const NotionView: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NotionPage[]>([]);
    const [selectedItemContent, setSelectedItemContent] = useState<string | NotionTableData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [databases, setDatabases] = useState<NotionPage[]>([]);
    const [selectedDatabaseId, setSelectedDatabaseId] = useState('');
    const [isLoadingDatabases, setIsLoadingDatabases] = useState(true);

    const isApiKeyMissing = !process.env.NOTION_API_KEY || process.env.NOTION_API_KEY === 'YOUR_NOTION_API_KEY_HERE';

    useEffect(() => {
        const fetchDatabases = async () => {
            if (isApiKeyMissing) {
                setIsLoadingDatabases(false);
                return;
            }
            try {
                const dbList = await getNotionDatabases();
                setDatabases(dbList);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Unknown error";
                setError(`Failed to load databases: ${errorMessage}`);
            } finally {
                setIsLoadingDatabases(false);
            }
        };
        fetchDatabases();
    }, [isApiKeyMissing]);


    const handleSearch = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        if (!query.trim() || isApiKeyMissing) return;

        setIsLoading(true);
        setError(null);
        setResults([]);
        setSelectedItemContent(null);
        setSelectedDatabaseId('');

        try {
            const pages = await searchNotionPages(query);
            setResults(pages);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(`Failed to search Notion: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemClick = async (item: NotionPage) => {
        setIsLoading(true);
        setError(null);
        setSelectedItemContent(null);
        setSelectedDatabaseId('');
        try {
             if (item.object === 'database') {
                const content = await queryNotionDatabase(item.id);
                setSelectedItemContent(content);
            } else {
                const content = await readNotionPageContent(item.id);
                setSelectedItemContent(content);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(`Failed to read content: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDatabaseSelect = async (databaseId: string) => {
        setSelectedDatabaseId(databaseId);
        if (!databaseId) {
            setSelectedItemContent(null);
            setError(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        setSelectedItemContent(null);
        setResults([]);
        setQuery('');
        try {
            const content = await queryNotionDatabase(databaseId);
            setSelectedItemContent(content);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(`Failed to read database content: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const browserWidget = (
        <WidgetCard title="Notion Browser" icon={<NotionIcon className="w-6 h-6" />}>
            <div className="p-4 space-y-6 h-full flex flex-col">
                <div>
                    <h3 className="text-lg font-semibold text-midnight-navy mb-2">Browse Databases</h3>
                    {isLoadingDatabases ? <p className="text-sm text-midnight-navy/70">Loading...</p> : (
                        <Select id="db-select" value={selectedDatabaseId} onChange={(e) => handleDatabaseSelect(e.target.value)} disabled={isApiKeyMissing || databases.length === 0}>
                            <option value="">{databases.length > 0 ? 'Select a database' : 'No databases found'}</option>
                            {databases.map(db => <option key={db.id} value={db.id}>{db.title}</option>)}
                        </Select>
                    )}
                </div>
                <div className="my-6 border-t border-midnight-navy/10" />
                <form onSubmit={handleSearch} className="flex-grow flex flex-col">
                    <h3 className="text-lg font-semibold text-midnight-navy mb-4">Search</h3>
                    <div className="flex gap-3">
                        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search pages..." />
                        <Button type="submit" disabled={isLoading || isApiKeyMissing || !query.trim()}>Search</Button>
                    </div>
                    <ApiKeyWarning isApiKeyMissing={isApiKeyMissing} />
                    <div className="mt-6 border-t border-midnight-navy/10 pt-4 flex-grow overflow-y-auto">
                        <h4 className="font-semibold text-midnight-navy mb-2">Results</h4>
                        {results.length > 0 ? (
                            <div className="space-y-2">{results.map(page => <PageItem key={page.id} page={page} onClick={() => handleItemClick(page)} />)}</div>
                        ) : <p className="text-sm text-midnight-navy/60 text-center py-4">No search results.</p>}
                    </div>
                </form>
            </div>
        </WidgetCard>
    );

    const contentWidget = (
        <WidgetCard title="Content Viewer" icon={<DatabaseIcon className="w-6 h-6" />}>
            <div className="p-4 h-full overflow-y-auto">
                {isLoading && <p className="text-center animate-pulse">Loading...</p>}
                {error && <p className="text-center text-error-red">{error}</p>}
                {selectedItemContent ? (
                    typeof selectedItemContent === 'string' ? (
                        <div className="text-sm text-midnight-navy/90 whitespace-pre-wrap leading-relaxed">{selectedItemContent}</div>
                    ) : <NotionTable data={selectedItemContent} />
                ) : (!isLoading && !error && <p className="text-sm text-midnight-navy/60 text-center py-4">Select an item to view its content.</p>)}
            </div>
        </WidgetCard>
    );

    return (
        <div className="w-full flex flex-col bg-dark-bg p-6" style={{ height: 'calc(100vh - 72px)'}}>
            <VerticalSplitter storageKey="notion-main-v-splitter" initialSize={35} minSize={25} maxSize={50}>
                {browserWidget}
                {contentWidget}
            </VerticalSplitter>
        </div>
    );
};