

import React, { useState, useEffect, useCallback } from 'react';
import { fetchSheetData, appendRow, updateRow, deleteRow } from '../../services/googleSheetsService';
import { hydrateData } from '../../services/dataHydrationService';
import type { TokenResponse, SheetUser } from '../../types';
import { useToast } from './ui/Toast';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Skeleton } from './ui/Skeleton';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDoubleLeftIcon } from './icons/ChevronDoubleLeftIcon';
import { SheetKey } from '../../services/configService';

interface TeamSettingsViewProps {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  onSignInRequest: () => void;
  setActiveView: (view: 'settings') => void;
}

const DarkCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-dark-surface rounded-xl p-6 ${className || ''}`}>
        {children}
    </div>
);

const PersonCard: React.FC<{ person: SheetUser; onEdit: () => void; onDelete: () => void; }> = ({ person, onEdit, onDelete }) => {
    return (
        <DarkCard>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-accent-blue">{String(person.full_name)}</h3>
                <p className="text-sm text-text-light font-semibold">{String(person.role_title)}</p>
                <p className="text-xs text-text-muted">{String(person.email)}</p>
                {person.manager && <p className="text-xs text-text-muted mt-1">Manager: {String((person.manager as SheetUser).full_name)}</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-dark-border flex justify-end gap-2">
                <Button onClick={onEdit} variant="secondary" size="sm" className="!p-1.5" title="Edit">
                    <EditIcon className="w-4 h-4" />
                </Button>
                <Button onClick={onDelete} variant="danger" size="sm" className="!p-1.5" title="Delete">
                    <TrashIcon className="w-4 h-4" />
                </Button>
            </div>
        </DarkCard>
    );
};

export const TeamSettingsView: React.FC<TeamSettingsViewProps> = ({ isAuthenticated, token, onSignInRequest, setActiveView }) => {
    const [people, setPeople] = useState<SheetUser[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPerson, setCurrentPerson] = useState<Partial<SheetUser> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const accessToken = token ? token.access_token : null;
            const peopleData = await fetchSheetData(SheetKey.PEOPLE, accessToken);
            if (peopleData.length > 0) {
                const allData = { [SheetKey.PEOPLE]: peopleData };
                const hydratedPeople = hydrateData(peopleData, SheetKey.PEOPLE, allData);
                setPeople(hydratedPeople);
                setHeaders(Object.keys(peopleData[0]));
            } else {
                setPeople([]);
                setHeaders([]);
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load team data.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [token, toast]);

    useEffect(() => {
        fetchData();
    }, [isAuthenticated, fetchData]);

    const handleOpenModal = (person?: SheetUser) => {
        if (!isAuthenticated) {
            toast.info("Please sign in to add or edit team members.");
            return;
        }
        if (person) {
            setCurrentPerson({ ...person });
        } else {
            const newPerson = headers.reduce((acc, header) => ({ ...acc, [header]: '' }), {});
            setCurrentPerson(newPerson);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPerson(null);
    };
    
    const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentPerson(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPerson || !token) return;

        setIsSaving(true);
        try {
            if (currentPerson.rowIndex !== undefined) {
                await updateRow(SheetKey.PEOPLE, currentPerson.rowIndex, currentPerson as SheetUser, token.access_token);
                toast.success("Team member updated!");
            } else {
                await appendRow(SheetKey.PEOPLE, currentPerson, token.access_token);
                toast.success("Team member added!");
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Save failed.';
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (person: SheetUser) => {
        if (!token) {
             toast.info("Please sign in to delete team members.");
            return;
        }

        const personName = person.full_name || 'this person';
        if (!window.confirm(`Are you sure you want to delete "${personName}"?`)) return;

        try {
            await deleteRow(SheetKey.PEOPLE, person.rowIndex, token.access_token);
            toast.success("Team member deleted.");
            fetchData();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Delete failed.';
            toast.error(msg);
        }
    };

    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <DarkCard key={i} className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                </DarkCard>
            ))}
        </div>
    );

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Button onClick={() => setActiveView('settings')} variant="secondary" size="sm" className="!p-2">
                        <ChevronDoubleLeftIcon className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-text-light">Team Settings</h1>
                        <p className="text-text-muted mt-1">Manage team members from your 'PEOPLE' sheet.</p>
                    </div>
                </div>
                {isAuthenticated && (
                    <Button onClick={() => handleOpenModal()} variant="creative" leftIcon={<PlusIcon className="w-5 h-5"/>}>
                        Add Member
                    </Button>
                )}
            </div>

            {!isAuthenticated && (
                <DarkCard className="text-center py-4 mb-6 !bg-accent-orange/10 border border-accent-orange">
                    <p className="text-text-light font-semibold">You are viewing mock data.</p>
                    <p className="text-text-muted/80 text-sm">Sign in to connect to your Google Sheet and manage your real team data.</p>
                    <Button onClick={onSignInRequest} variant="creative" className="mt-3" size="sm">
                        Sign In
                    </Button>
                </DarkCard>
            )}

            {isLoading ? <SkeletonLoader /> : (
                people.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {people.map(person => (
                            <PersonCard 
                                key={person.rowIndex} 
                                person={person}
                                onEdit={() => handleOpenModal(person)}
                                onDelete={() => handleDelete(person)}
                            />
                        ))}
                    </div>
                ) : (
                    <DarkCard className="text-center py-12">
                        <p className="text-text-muted">No team members found in your sheet, or the sheet is empty.</p>
                    </DarkCard>
                )
            )}
            
            {currentPerson && (
                 <Modal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    title={currentPerson.rowIndex !== undefined ? 'Edit Team Member' : 'Add New Team Member'} 
                    size="lg"
                >
                    <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {headers
                            .filter(h => h !== 'rowIndex' && !h.endsWith('_resolved') && h !== 'manager')
                            .map(header => (
                            <Input
                                key={header}
                                label={header.replace(/_/g, ' ')}
                                name={header}
                                value={String(currentPerson[header] || '')}
                                onChange={handleModalInputChange}
                            />
                        ))}
                        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-dark-surface pb-1">
                            <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" variant="primary" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};
