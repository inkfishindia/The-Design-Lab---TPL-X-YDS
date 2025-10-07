import React from 'react';
import { SheetIcon } from './icons/SheetIcon';
import { DriveIcon } from './icons/DriveIcon';
import { GmailIcon } from './icons/GmailIcon';
import { TasksIcon } from './icons/TasksIcon';

interface WidgetIconsProps {
  isAuthenticated: boolean;
}

const widgets = [
  {
    name: 'Tasks',
    Icon: TasksIcon,
    url: 'https://tasks.google.com/u/0/embed/?origin=https://mail.google.com',
  },
  {
    name: 'Sheets',
    Icon: SheetIcon,
    url: 'https://docs.google.com/spreadsheets/',
  },
  {
    name: 'Drive',
    Icon: DriveIcon,
    url: 'https://drive.google.com/',
  },
  {
    name: 'Gmail',
    Icon: GmailIcon,
    url: 'https://mail.google.com/',
  },
];

const WidgetIcon: React.FC<{
    name: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    url: string;
    isAuthenticated: boolean;
}> = ({ name, Icon, url, isAuthenticated }) => {
    const title = isAuthenticated ? `Open ${name}` : `Sign in to access ${name}`;
    const commonClasses = "w-6 h-6 transition-all duration-300";

    if (isAuthenticated) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" title={title} className="hover:opacity-80">
                <Icon className={commonClasses} />
            </a>
        );
    } else {
        return (
            <div title={title} className="cursor-not-allowed">
                <Icon className={`${commonClasses} grayscale opacity-50`} />
            </div>
        );
    }
};

export const WidgetIcons: React.FC<WidgetIconsProps> = ({ isAuthenticated }) => {
  return (
    <div className="flex items-center gap-4">
      {widgets.map((widget) => (
        <WidgetIcon key={widget.name} {...widget} isAuthenticated={isAuthenticated} />
      ))}
    </div>
  );
};
