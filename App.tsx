
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
  const [activeTargetId, setActiveTargetId] = useState<string | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('family_tree_data', JSON.stringify(people));
  }, [people]);

  const selectedPerson = useMemo(() => 
    people.find(p => p.id === selectedPersonId) || null, 
  [people, selectedPersonId]);

  const activeTargetPerson = useMemo(() => 
    people.find(p => p.id === activeTargetId), 
  [people, activeTargetId]);

  const canEditTree = !!currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'BRANCH_ADMIN');

  const checkAddPermission = useCallback((targetId?: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'BRANCH_ADMIN' && targetId) {
      if (currentUser.assignedBranchId) {
        const isDescendant = (startId: string, searchId: string): boolean => {
          if (startId === searchId) return true;
          const directChildren = people.filter(p => p.parentId === startId);
          return directChildren.some(child => isDescendant(child.id, searchId));
        };
        // For branch admins, they can only add people to their assigned branch or its descendants.
        // Adding a PARENT to the branch root is restricted to SUPER_ADMIN.
        return isDescendant(currentUser.assignedBranchId, targetId);
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

  const handleAddPerson = (data: Partial<Person> & { relType?: RelationType, targetId?: string }) => {
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
      // For CHILD relation, targetId becomes parent
      parentId: data.relType === 'CHILD' ? data.targetId : undefined,
      // For SPOUSE relation, set bidirectional spouseId later
      spouseId: data.relType === 'SPOUSE' ? data.targetId : undefined,
    };

    setPeople(prev => {
      let updated = [...prev, newPerson];

      if (data.relType === 'SPOUSE' && data.targetId) {
        // Bidirectional link for spouses
        updated = updated.map(p => p.id === data.targetId ? { ...p, spouseId: newId } : p);
      } else if (data.relType === 'PARENT' && data.targetId) {
        // If targetId is having a parent added, the new person becomes the parent of targetId
        updated = updated.map(p => p.id === data.targetId ? { ...p, parentId: newId } : p);
      }
      
      return updated;
    });

    setIsAddModalOpen(false);
    setActiveTargetId(undefined);
  };

  const handleOpenAddModal = (targetId?: string) => {
    if (targetId && !checkAddPermission(targetId)) {
      alert("You don't have permission to modify this branch.");
      return;
    }
    setActiveTargetId(targetId);
    setIsAddModalOpen(true);
  };

  const handleAddRoot = () => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      alert("Only Super Admins can add new roots.");
      return;
    }
    setActiveTargetId(undefined);
    setIsAddModalOpen(true);
  };

  const handleInspectData = () => {
    console.group("🌳 LegacyTree Data Inspection");
    console.log("Current Users Count:", people.length);
    console.table(people.map(p => ({
      ID: p.id,
      Name: p.name,
      Parent: p.parentId || 'None',
      Spouse: p.spouseId || 'None',
      Birth: p.birthDate
    })));
    console.log("Raw JSON:", JSON.stringify(people, null, 2));
    console.groupEnd();
    alert("Data logged to browser console! (Press F12 to view)");
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
              {currentUser.role === 'SUPER_ADMIN' && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleInspectData} className="text-slate-500">
                    <span className="mr-2"><ICONS.Terminal /></span> Inspect Data
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAddRoot}>
                    <span className="mr-2"><ICONS.Plus /></span> New Branch
                  </Button>
                </div>
              )}
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
        
        {people.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-30">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-serif font-bold text-slate-900">Your Family Story Starts Here</h2>
              <p className="text-slate-500 max-w-md mx-auto">Create the first record in your lineage to begin visualizing your family history.</p>
              <Button size="lg" onClick={() => handleOpenAddModal()}>
                Add First Person
              </Button>
            </div>
          </div>
        )}
      </main>

      <PersonDetails 
        person={selectedPerson} 
        onClose={() => setSelectedPersonId(null)} 
        canEdit={canEditTree}
        onAddRelation={handleOpenAddModal}
      />

      {isAddModalOpen && (
        <AddPersonModal 
          targetPerson={activeTargetPerson}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPerson}
          isFirstPerson={people.length === 0}
        />
      )}
    </div>
  );
};

export default App;
