
import React from 'react';
import { Person } from '../types';
import { Button } from './Button';
import { ICONS } from '../constants';

interface PersonDetailsProps {
  person: Person | null;
  onClose: () => void;
  onEdit?: (person: Person) => void;
  onAddRelation?: (targetId: string) => void;
  canEdit: boolean;
}

export const PersonDetails: React.FC<PersonDetailsProps> = ({ person, onClose, onEdit, onAddRelation, canEdit }) => {
  if (!person) return null;

  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 overflow-y-auto ${person ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-5 space-y-6">
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ICONS.Close />
          </button>
          <div className="flex gap-1.5">
            {canEdit && onAddRelation && (
              <Button variant="ghost" size="sm" onClick={() => onAddRelation(person.id)} className="h-8 px-2 text-xs">
                <span className="mr-1"><ICONS.Plus /></span>
                Relative
              </Button>
            )}
            {canEdit && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(person)} className="h-8 px-2 text-xs">
                <span className="mr-1"><ICONS.Edit /></span>
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white mb-4 bg-slate-100">
            <img 
              src={person.mainImage} 
              alt={person.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 text-center leading-tight">{person.name}</h2>
          <p className="text-slate-500 font-medium text-xs mt-1">
            {person.birthDate.split('-')[0]} {person.deathDate ? `— ${person.deathDate.split('-')[0]}` : '(Living)'}
          </p>
        </div>

        {person.spouseId && (
          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
             <h3 className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Status</h3>
             <p className="text-indigo-900 font-semibold italic text-sm">Partnered</p>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Biography</h3>
          <p className="text-slate-700 leading-snug text-sm">
            {person.bio || "No biography available for this ancestor."}
          </p>
        </div>

        {person.gallery && person.gallery.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Memories</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {person.gallery.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-md overflow-hidden bg-slate-100">
                  <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
