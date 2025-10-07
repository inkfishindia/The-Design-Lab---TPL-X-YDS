import React from 'react';
import { Spacer } from './Spacer';

interface DashboardLayoutProps {
  metrics: React.ReactNode;
  projects: React.ReactNode;
  tasks: React.ReactNode;
  activity: React.ReactNode;
  units: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ metrics, projects, tasks, activity, units }) => {
  return (
    <div className="space-y-6">
      <div>{metrics}</div>
      <Spacer />
      <div>{units}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>{projects}</div>
        <div>{tasks}</div>
      </div>
      <div>{activity}</div>
    </div>
  );
};
