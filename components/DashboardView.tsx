import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Chat } from './Chat';
import { GoogleCalendarEmbed } from './GoogleCalendarEmbed';
import { MyTasksWidget } from './MyTasksWidget';
import { GmailSnapshotWidget } from './GmailSnapshotWidget';
import { getCalendarList } from '../services/googleCalendarService';
import { getTaskLists } from '../services/googleTasksService';
import type { CalendarListItem, GoogleUser, TaskList, TokenResponse } from '../types';
import { WidgetCard } from './ui/WidgetCard';

import { ChatIcon } from './icons/ChatIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { TasksIcon } from './icons/TasksIcon';
import { GmailIcon } from './icons/GmailIcon';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  user: GoogleUser | null;
  onSignInRequest: () => void;
}

const getFromLS = (key: string) => {
    let ls: any = {};
    if (window.localStorage) {
      try {
        ls = JSON.parse(window.localStorage.getItem('dashboardLayouts') || '{}');
      } catch (e) { /* Ignore */ }
    }
    return ls[key];
};
  
const saveToLS = (key: string, value: any) => {
    if (window.localStorage) {
        window.localStorage.setItem(
            'dashboardLayouts',
            JSON.stringify({
            [key]: value
            })
        );
    }
};

export const DashboardView: React.FC<DashboardViewProps> = ({ isAuthenticated, token, user, onSignInRequest }) => {
    const [calendarList, setCalendarList] = useState<CalendarListItem[]>([]);
    const [primaryCalendarId, setPrimaryCalendarId] = useState<string>('primary');
    const [taskLists, setTaskLists] = useState<TaskList[]>([]);
    const [primaryTaskListId, setPrimaryTaskListId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    
    const initialLayouts = getFromLS('layouts') || {
        lg: [ // Desktop (12 cols)
            { i: 'chat', x: 0, y: 0, w: 4, h: 12, minW: 3, minH: 6 },
            { i: 'calendar', x: 4, y: 0, w: 8, h: 7, minW: 4, minH: 5 },
            { i: 'tasks', x: 4, y: 7, w: 4, h: 5, minW: 3, minH: 4 },
            { i: 'gmail', x: 8, y: 7, w: 4, h: 5, minW: 3, minH: 4 }
        ],
        md: [ // Tablet (10 cols)
            { i: 'chat', x: 0, y: 0, w: 10, h: 6, minW: 3, minH: 5 },
            { i: 'calendar', x: 0, y: 6, w: 10, h: 7, minW: 4, minH: 5 },
            { i: 'tasks', x: 0, y: 13, w: 5, h: 5, minW: 3, minH: 4 },
            { i: 'gmail', x: 5, y: 13, w: 5, h: 5, minW: 3, minH: 4 }
        ],
        sm: [ // Mobile Landscape (6 cols)
            { i: 'chat', x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 5 },
            { i: 'calendar', x: 0, y: 6, w: 6, h: 7, minW: 4, minH: 5 },
            { i: 'tasks', x: 0, y: 13, w: 6, h: 5, minW: 3, minH: 4 },
            { i: 'gmail', x: 0, y: 18, w: 6, h: 5, minW: 3, minH: 4 }
        ],
        xs: [ // Mobile Portrait (4 cols)
            { i: 'chat', x: 0, y: 0, w: 4, h: 6, minW: 2, minH: 5 },
            { i: 'calendar', x: 0, y: 6, w: 4, h: 7, minW: 2, minH: 5 },
            { i: 'tasks', x: 0, y: 13, w: 4, h: 5, minW: 2, minH: 4 },
            { i: 'gmail', x: 0, y: 18, w: 4, h: 5, minW: 2, minH: 4 }
        ],
    };
    const [layouts, setLayouts] = useState(initialLayouts);

    useEffect(() => {
        const fetchData = async () => {
            if (isAuthenticated && token) {
                try {
                    const [calendars, tasks] = await Promise.all([
                        getCalendarList(token.access_token),
                        getTaskLists(token.access_token)
                    ]);
                    
                    setCalendarList(calendars);
                    const primaryCal = calendars.find(c => c.primary) || calendars[0];
                    if (primaryCal) setPrimaryCalendarId(primaryCal.id);

                    const fetchedTaskLists = tasks.items || [];
                    setTaskLists(fetchedTaskLists);
                    if (fetchedTaskLists.length > 0) {
                        setPrimaryTaskListId(fetchedTaskLists[0].id);
                    }

                } catch (error) {
                    console.error("Failed to fetch dashboard data:", error);
                }
            } else {
                setCalendarList([]);
                setPrimaryCalendarId('primary');
                setTaskLists([]);
                setPrimaryTaskListId(null);
            }
        };
        fetchData();
    }, [isAuthenticated, token]);

    const handleEventCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    const onLayoutChange = (layout: any, allLayouts: any) => {
        saveToLS('layouts', allLayouts);
        setLayouts(allLayouts);
    };

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={50}
            draggableHandle=".drag-handle"
        >
            <div key="chat">
                <WidgetCard title="AI Assistant" icon={<ChatIcon className="w-full h-full" />}>
                    <Chat 
                        isAuthenticated={isAuthenticated}
                        token={token}
                        onEventCreated={handleEventCreated}
                        onSignInRequest={onSignInRequest}
                        primaryTaskListId={primaryTaskListId}
                    />
                </WidgetCard>
            </div>
            <div key="calendar">
                <WidgetCard title="Google Calendar" icon={<CalendarIcon className="w-full h-full" />}>
                    <GoogleCalendarEmbed 
                        calendarId={primaryCalendarId}
                        setCalendarId={setPrimaryCalendarId}
                        refreshKey={refreshKey}
                        isAuthenticated={isAuthenticated}
                        calendarList={calendarList}
                    />
                </WidgetCard>
            </div>
            <div key="tasks">
                <WidgetCard title="My Tasks" icon={<TasksIcon className="w-full h-full" />}>
                     <MyTasksWidget 
                        isAuthenticated={isAuthenticated} 
                        token={token}
                        primaryTaskListId={primaryTaskListId}
                        taskLists={taskLists}
                        onTaskListChange={setPrimaryTaskListId}
                    />
                </WidgetCard>
            </div>
            <div key="gmail">
                <WidgetCard title="Gmail Snapshot" icon={<GmailIcon className="w-full h-full" />}>
                    <GmailSnapshotWidget isAuthenticated={isAuthenticated} token={token} />
                </WidgetCard>
            </div>
        </ResponsiveGridLayout>
    );
};