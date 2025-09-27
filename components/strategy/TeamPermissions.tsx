import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

interface TeamPermissionsProps {
    onTeamChange: (teamContext: string) => void;
}

export const TeamPermissions: React.FC<TeamPermissionsProps> = ({ onTeamChange }) => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedTeam = localStorage.getItem('teamPermissions_team');
      const parsedTeam = savedTeam ? JSON.parse(savedTeam) : [];
      setTeam(parsedTeam);
      updateParentContext(parsedTeam);
    } catch (error) {
      console.error("Failed to load team from localStorage", error);
    }
  }, []);

  const updateParentContext = (currentTeam: TeamMember[]) => {
      const contextString = currentTeam.map(t => `${t.name} is the ${t.role}.`).join('\n');
      onTeamChange(contextString);
  };

  const saveTeam = (newTeam: TeamMember[]) => {
    setTeam(newTeam);
    localStorage.setItem('teamPermissions_team', JSON.stringify(newTeam));
    updateParentContext(newTeam);
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    if (editingId) {
      saveTeam(team.map(member => member.id === editingId ? { ...member, name, role } : member));
      setEditingId(null);
    } else {
      const newMember: TeamMember = { id: Date.now().toString(), name, role };
      saveTeam([...team, newMember]);
    }
    
    setName('');
    setRole('');
    nameInputRef.current?.focus();
  };
  
  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setName(member.name);
    setRole(member.role);
    nameInputRef.current?.focus();
  };

  const handleRemove = (id: string) => {
    saveTeam(team.filter(member => member.id !== id));
    if (editingId === id) {
        setEditingId(null);
        setName('');
        setRole('');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setRole('');
  };

  return (
    <div>
      <h4 className="text-md font-semibold text-midnight-navy block mb-2">Team & Permissions</h4>
      <p className="text-xs text-midnight-navy/70 mb-3">Define team roles for intelligent task delegation.</p>
      
      <div className="space-y-2 mb-4">
        {team.map(member => (
          <div key={member.id} className="flex items-center justify-between bg-heritage-blue/5 p-2 rounded-md">
            <div>
                <p className="text-sm font-medium text-midnight-navy">{member.name}</p>
                <p className="text-xs text-midnight-navy/70">{member.role}</p>
            </div>
            <div className="space-x-2">
                <button onClick={() => handleEdit(member)} className="text-xs font-semibold text-heritage-blue hover:underline">EDIT</button>
                <button onClick={() => handleRemove(member.id)} className="text-xs font-semibold text-error-red hover:underline">REMOVE</button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddOrUpdate} className="space-y-2 p-3 bg-heritage-blue/5 rounded-md">
        <div className="flex gap-2">
            <Input 
                ref={nameInputRef}
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Team Member Name" 
            />
            <Input 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                placeholder="Role or Specialty" 
            />
        </div>
        <div className="flex gap-2">
            <Button type="submit" className="w-full">
                {editingId ? 'Update Member' : 'Add Member'}
            </Button>
            {editingId && (
                <Button type="button" onClick={handleCancelEdit} variant="secondary">
                    Cancel
                </Button>
            )}
        </div>
      </form>
    </div>
  );
};