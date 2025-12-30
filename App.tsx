
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole, Person, RelationType } from './types';
import { INITIAL_DATA, ICONS } from './constants';
import { TreeVisualization } from './components/TreeVisualization';
import { PersonDetails } from './components/PersonDetails';
import { AddPersonModal } from './components/AddPersonModal';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('family_tree_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeParentId, setActiveParentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('family_tree_data', JSON.stringify(people));
  }, [people]);

  const selectedPerson = useMemo(() => 
    people.find(p => p.id === selectedPersonId) || null, 
  [people, selectedPersonId]);

  const canAddRoot = currentUser?.role === 'SUPER_ADMIN';
  const canEditTree = !!currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'BRANCH_ADMIN');

  const checkAddPermission = useCallback((parentId?: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'BRANCH_ADMIN' && parentId) {
      if (currentUser.assignedBranchId) {
        const isDescendant = (startId: string, targetId: string): boolean => {
          if (startId === targetId) return true;
          const directChildren = people.filter(p => p.parentId === startId);
          return directChildren.some(child => isDescendant(child.id, targetId));
        };
        return isDescendant(currentUser.assignedBranchId, parentId);
      }
    }
    return false;
  }, [currentUser, people]);

  const handleLogin = (role: UserRole) => {
    const mockUser: User = {
      id: 'user-1',
      email: role === 'SUPER_ADMIN' ? 'admin@heritage.com' : 'martha@heritage.com',
      name: role === 'SUPER_ADMIN' ? 'System Administrator' : 'Martha (Branch Admin)',
      role: role,
      assignedBranchId: role === 'BRANCH_ADMIN' ? 'child-1' : undefined
    };
    setCurrentUser(mockUser);
  };

  const handleLogout = () => setCurrentUser(null);

  const handleAddPerson = (data: Partial<Person> & { relType?: RelationType }) => {
    const newId = `p-${Date.now()}`;
    const newPerson: Person = {
      id: newId,
      name: data.name || 'Unknown',
      gender: data.gender || 'Other',
      birthDate: data.birthDate || '',
      deathDate: data.deathDate,
      bio: data.bio || '',
      mainImage: data.mainImage || 'https://picsum.photos/400/400',
      gallery: [],
      parentId: data.relType === 'CHILD' ? data.parentId : undefined,
      spouseId: data.relType === 'SPOUSE' ? data.spouseId : undefined,
    };

    setPeople(prev => {
      const updated = [...prev, newPerson];
      // Bidirectional link for spouses
      if (data.relType === 'SPOUSE' && data.spouseId) {
        return updated.map(p => p.id === data.spouseId ? { ...p, spouseId: newId } : p);
      }
      return updated;
    });

    setIsAddModalOpen(false);
    setActiveParentId(undefined);
  };

  const handleOpenAddModal = (parentId?: string) => {
    if (!checkAddPermission(parentId)) {
      alert("You don't have permission to add people here.");
      return;
    }
    setActiveParentId(parentId);
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <nav className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 z-40 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-serif">LegacyTree</h1>
        </div>

        <div className="flex items-center gap-4">
          {!currentUser ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleLogin('SUPER_ADMIN')}>Demo Admin</Button>
              <Button variant="primary" size="sm" onClick={() => handleLogin('SUPER_ADMIN')}>
                Sign In with Google
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currentUser.role.replace('_', ' ')}</p>
                <p className="text-sm font-semibold text-slate-700">{currentUser.name}</p>
              </div>
              <div className="h-8 w-[1px] bg-slate-200" />
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 rounded-full transition-all">
                <ICONS.LogOut />
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 relative">
        <TreeVisualization 
          data={people} 
          onSelectPerson={setSelectedPersonId} 
          onAddRelation={handleOpenAddModal}
          canEdit={canEditTree}
        />
      </main>

      <PersonDetails 
        person={selectedPerson} 
        onClose={() => setSelectedPersonId(null)} 
        canEdit={canEditTree}
      />

      {isAddModalOpen && (
        <AddPersonModal 
          parentId={activeParentId}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPerson}
          isFirstPerson={people.length === 0}
        />
      )}
    </div>
  );
};

export default App;
