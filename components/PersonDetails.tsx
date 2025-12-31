
import React, { useState, useEffect } from 'react';
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
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Reset active image when the selected person changes
  useEffect(() => {
    if (person) {
      setActiveImage(person.mainImage);
    } else {
      setActiveImage(null);
    }
  }, [person?.id]);

  if (!person) return null;

  const allImages = [person.mainImage, ...(person.gallery || [])];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px] animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header/Actions */}
        <div className="absolute top-0 inset-x-0 z-10 p-4 flex justify-between items-center pointer-events-none">
          <button 
            onClick={onClose} 
            className="p-2 bg-white/80 hover:bg-white backdrop-blur shadow-sm rounded-full transition-all text-slate-700 pointer-events-auto"
          >
            <ICONS.Close />
          </button>
          <div className="flex gap-1.5 pointer-events-auto">
            {canEdit && onAddRelation && (
              <Button variant="ghost" size="sm" onClick={() => onAddRelation(person.id)} className="bg-white/80 hover:bg-white backdrop-blur shadow-sm h-9 px-3 text-[11px] font-bold rounded-full border border-white/20">
                <span className="mr-1"><ICONS.Plus /></span>
                Relative
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {/* Large Hero Image - Removed hover effects and overlay text */}
          <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
            <img 
              src={activeImage || person.mainImage} 
              alt={person.name} 
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>

          <div className="p-6 space-y-6">
            {/* Person Basic Info - Now outside the image */}
            <div className="space-y-1.5 border-b border-slate-50 pb-4">
              <h2 className="text-3xl font-serif font-bold text-slate-900 leading-tight">
                {person.name}
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-slate-500 font-medium text-sm">
                  {person.birthDate.split('-')[0]} {person.deathDate ? `— ${person.deathDate.split('-')[0]}` : '• Living'}
                </p>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  person.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 
                  person.gender === 'Female' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {person.gender}
                </span>
              </div>
            </div>

            {/* Gallery / Image Switcher */}
            {allImages.length > 1 && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Captured Memories</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveImage(img)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 ring-offset-2 ${
                        activeImage === img ? 'ring-2 ring-indigo-500 scale-105' : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Memory ${idx}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {person.spouseId && (
              <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Family Status</h3>
                  <p className="text-indigo-900 font-semibold italic text-xs">Joined in Marriage</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                  <ICONS.User />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Life Story</h3>
              <p className="text-slate-600 leading-relaxed text-sm antialiased">
                {person.bio || "The details of this ancestor's journey are waiting to be told."}
              </p>
            </div>

            {canEdit && onEdit && (
              <div className="pt-2">
                <Button variant="outline" size="md" onClick={() => onEdit(person)} className="w-full h-11 rounded-2xl text-xs font-bold gap-2">
                  <ICONS.Edit />
                  Edit Biography & Records
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
