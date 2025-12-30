
import React from 'react';
import { Person } from '../types';
import { Button } from './Button';
import { ICONS } from '../constants';

interface PersonDetailsProps {
  person: Person | null;
  onClose: () => void;
  onEdit?: (person: Person) => void;
  canEdit: boolean;
}

export const PersonDetails: React.FC<PersonDetailsProps> = ({ person, onClose, onEdit, canEdit }) => {
  if (!person) return null;

  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 overflow-y-auto ${person ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-start">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ICONS.Close />
          </button>
          {canEdit && onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(person)}>
              <span className="mr-2"><ICONS.Edit /></span>
              Edit
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white mb-6 bg-slate-100">
            <img 
              src={person.mainImage} 
              alt={person.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 text-center leading-tight">{person.name}</h2>
          <p className="text-slate-500 font-medium mt-2">
            {person.birthDate} {person.deathDate ? `— ${person.deathDate}` : '(Living)'}
          </p>
        </div>

        {person.spouseId && (
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
             <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Spouse</h3>
             <p className="text-indigo-900 font-semibold italic text-lg">Partnered with their beloved.</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Biography</h3>
          <p className="text-slate-700 leading-relaxed text-lg">
            {person.bio || "No biography available for this ancestor."}
          </p>
        </div>

        {person.gallery && person.gallery.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memories</h3>
            <div className="grid grid-cols-2 gap-2">
              {person.gallery.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
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
