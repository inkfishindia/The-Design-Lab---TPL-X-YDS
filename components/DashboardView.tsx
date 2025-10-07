

import React, { useState, useEffect, useCallback } from 'react';
import type { GoogleUser, TokenResponse, Project, ProjectTask, SheetUser, CalendarEvent, ChatMessage } from '../types';
import { motion } from 'framer-motion';

import { useToast } from './ui/Toast';
import { fetchSheetData } from '../services/googleSheetsService';
import { getEvents } from '../services/googleCalendarService';
import { hydrateData } from '../services/dataHydrationService';
import { VerticalSplitter, HorizontalSplitter } from './ui/Splitter';
import { AIStudioWidget } from './AIStudioWidget';
import { SheetKey } from '../services/configService';

// --- HELPER ICONS (Inlined for simplicity) ---

const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="m2.01 21 20.99-9-20.99-9-.01 7 15 2-15 2 .01 7z"/>
    </svg>
);

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 4.458 10 4.458c.478 0 6.268.485 9.542 5.542-.478.485-6.268 5.542-9.542 5.542C3.732 15.542.478 10.485.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);


// --- NEW DASHBOARD COMPONENTS ---

const DashboardCard: React.FC<{ children: React.ReactNode; className?: string, title?: string }> = ({ children, className = '', title }) => (
    <div className={`bg-dark-surface rounded-xl flex flex-col h-full overflow-hidden ${className}`}>
        {title && <h3 className="text-lg font-semibold text-text-light px-6 pt-6 pb-2 flex-shrink-0">{title}</h3>}
        <div className={`flex-grow min-h-0 ${title ? '' : ''}`}>
            {children}
        </div>
    </div>
);

const CircularProgress: React.FC<{ progress: number; isGradient?: boolean }> = ({ progress, isGradient = false }) => {
    const radius = 28;
    const stroke = 6;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-16 h-16 flex-shrink-0">
             <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 68 68"
            >
                {isGradient && 
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4A90E2" />
                            <stop offset="100%" stopColor="#00BFFF" />
                        </linearGradient>
                    </defs>
                }
                <circle stroke="#3E455D" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={34} cy={34} />
                <motion.circle
                    stroke={isGradient ? "url(#progressGradient)" : "#60A5FA"}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={34}
                    cy={34}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-light">
                {progress}%
            </span>
        </div>
    );
};


const StatCard: React.FC<{ title: string; value: string; subtitle: string }> = ({ title, value, subtitle }) => (
    <div className="bg-dark-surface rounded-xl p-6">
        <p className="text-sm font-medium text-text-muted">{title}</p>
        <p className="text-4xl font-bold text-text-light mt-2">{value}</p>
        {subtitle && <p className="text-xs text-text-muted mt-4">{subtitle}</p>}
    </div>
);

const StatCards: React.FC<{projects: Project[], leadsCount: number}> = ({projects, leadsCount}) => {
    const activeProjects = projects.filter(p => p.Status !== 'Completed').length;

    const stats = [
        { title: 'Active Projects', value: String(activeProjects), subtitle: '' },
        { title: 'Order Value', value: '₹ 7,2K', subtitle: 'Lead Conversion on Month' },
        { title: 'Leads', value: String(leadsCount), subtitle: 'New Leads of Month' },
        { title: 'Revenue', value: '₹92%', subtitle: 'System Meelnes' },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
        </div>
    );
};

const ProjectOverview: React.FC<{projects: Project[], isLoading: boolean}> = ({ projects, isLoading }) => {
    const projectsToShow = projects.slice(0, 2);
    return (
        <DashboardCard title="My Project Overview">
            <div className="space-y-4 px-6 pb-6 pt-4 overflow-y-auto h-full">
                {isLoading && (
                     <>
                        <div className="bg-dark-bg/50 rounded-lg p-3 h-20 animate-pulse"/>
                        <div className="bg-dark-bg/50 rounded-lg p-3 h-20 animate-pulse"/>
                    </>
                )}
                {!isLoading && projectsToShow.length === 0 && <p className="text-center text-sm text-text-muted py-10">No projects to display.</p>}
                {!isLoading && projectsToShow.map((p, i) => (
                    <div key={p.project_id} className="flex items-center gap-4 bg-dark-bg/50 p-3 rounded-lg">
                        <img src={`https://i.pravatar.cc/40?img=${i + 1}`} alt="Avatar" className="w-10 h-10 rounded-full" />
                        <div className="flex-grow">
                            <p className="font-semibold text-text-light">{p['Project Name'] || 'Untitled Project'}</p>
                            <p className="text-xs text-text-muted">{p['owner_User_id_resolved']}</p>
                        </div>
                        <CircularProgress progress={Number(p.confidence_pct || 0)} isGradient={i % 2 !== 0} />
                         <div className="flex items-center gap-2">
                            <button className="text-text-muted hover:text-accent-blue"><PaperAirplaneIcon className="w-5 h-5"/></button>
                            <button className="text-text-muted hover:text-accent-blue"><EyeIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

const TeamSnapshot: React.FC<{people: SheetUser[], tasks: ProjectTask[], isLoading: boolean}> = ({ people, tasks, isLoading }) => {
    const teamWithUtilization = React.useMemo(() => {
        const loggedHoursByPerson: { [key: string]: number } = tasks.reduce((acc, task) => {
            const assigneeId = String(task['assignee_User_id']);
            const hours = parseFloat(String(task['estimate_hours'] || 0));
            if (assigneeId && !isNaN(hours)) {
                acc[assigneeId] = (acc[assigneeId] || 0) + hours;
            }
            return acc;
        }, {} as { [key: string]: number });

        return people.map((person, i) => {
            const id = String(person['user_id']);
            const capacity = parseFloat(String(person['weekly_hours_capacity'] || 40));
            const logged = loggedHoursByPerson[id] || 0;
            const utilization = capacity > 0 ? Math.round((logged / capacity) * 100) : 0;
            return { ...person, utilization, avatar: `https://i.pravatar.cc/32?img=${i + 3}` };
        });
    }, [people, tasks]);

    const teamToShow = teamWithUtilization.slice(0,4);
    
    return (
        <DashboardCard title="Team Snapshot">
            <div className="space-y-4 px-6 pb-6 pt-4 overflow-y-auto h-full">
                 {isLoading && <div className="bg-dark-bg/50 rounded-lg p-3 h-full animate-pulse"/>}
                 {!isLoading && teamToShow.length === 0 && <p className="text-center text-sm text-text-muted py-10">No team data to display.</p>}
                 {!isLoading && teamToShow.length > 0 && (
                    <>
                        <div className="flex justify-between items-center text-sm font-semibold">
                            <div className="flex -space-x-2">
                                {teamToShow.map(member => (
                                    <img key={String(member['user_id'])} src={member.avatar} alt={String(member['full_name'])} className="w-8 h-8 rounded-full border-2 border-dark-surface" />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-success-green"></span>
                                <span>Focus Time</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            {teamToShow.slice(0,3).map(member => (
                                <div key={String(member['user_id'])} className="grid grid-cols-5 items-center gap-4 text-sm">
                                    <span className="col-span-1 text-text-muted truncate">{String(member['full_name'])}</span>
                                    <div className="col-span-3">
                                        <div className="w-full bg-dark-bg rounded-full h-2.5">
                                            <div className="bg-accent-blue h-2.5 rounded-full" style={{ width: `${Math.min(100, member.utilization)}%` }} />
                                        </div>
                                    </div>
                                    <span className="col-span-1 font-semibold text-right text-text-light">{member.utilization}%</span>
                                </div>
                            ))}
                        </div>
                    </>
                 )}
            </div>
        </DashboardCard>
    );
};


interface DashboardViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  user: GoogleUser | null;
  onSignInRequest: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ isAuthenticated, token, user, onSignInRequest }) => {
    const toast = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [people, setPeople] = useState<SheetUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        if (!token && isAuthenticated) { // Only fetch if authenticated
             setIsLoading(false);
             return;
        };
        setIsLoading(true);
        try {
            const accessToken = token?.access_token || null;
            
            const [projData, taskData, peopleData] = await Promise.all([
                fetchSheetData(SheetKey.PROJECTS, accessToken),
                fetchSheetData(SheetKey.TASKS, accessToken),
                fetchSheetData(SheetKey.PEOPLE, accessToken),
            ]);
            
            const allData = {
                [SheetKey.PROJECTS]: projData,
                [SheetKey.TASKS]: taskData,
                [SheetKey.PEOPLE]: peopleData,
            };

            setProjects(hydrateData(projData, SheetKey.PROJECTS, allData));
            setTasks(hydrateData(taskData, SheetKey.TASKS, allData));
            setPeople(hydrateData(peopleData, SheetKey.PEOPLE, allData));

        } catch (error) {
            const msg = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(`Failed to load dashboard data: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, [token, toast, isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


  return (
    <div className="flex flex-col p-6 space-y-6">
        <div>
            <StatCards projects={projects} leadsCount={0} />
        </div>
        
        <main className="h-[120vh]">
            <HorizontalSplitter storageKey="dashboard-main-h-splitter">
                 <DashboardCard>
                    <AIStudioWidget 
                        isAuthenticated={isAuthenticated} 
                        token={token} 
                        onSignInRequest={onSignInRequest}
                        primaryTaskListId={null}
                    />
                 </DashboardCard>
                <VerticalSplitter storageKey="dashboard-bottom-v-splitter">
                    <ProjectOverview projects={projects} isLoading={isLoading}/>
                    <TeamSnapshot people={people} tasks={tasks} isLoading={isLoading} />
                </VerticalSplitter>
            </HorizontalSplitter>
        </main>
    </div>
  );
};
