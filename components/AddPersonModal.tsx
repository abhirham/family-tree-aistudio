
import React, { useState } from 'react';
import { Person, Gender, RelationType } from '../types';
import { Button } from './Button';
import { ICONS } from '../constants';

interface AddPersonModalProps {
  parentId?: string;
  onClose: () => void;
  onSubmit: (data: Partial<Person> & { relType?: RelationType }) => void;
  isFirstPerson: boolean;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({ 
  parentId, 
  onClose, 
  onSubmit,
  isFirstPerson 
}) => {
  const [relType, setRelType] = useState<RelationType>('CHILD');
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male' as Gender,
    birthDate: '',
    deathDate: '',
    bio: '',
    mainImage: `https://picsum.photos/seed/${Math.random()}/400/400`,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirstPerson && !parentId) return;
    
    onSubmit({ 
      ...formData, 
      parentId: relType === 'CHILD' ? parentId : undefined,
      spouseId: relType === 'SPOUSE' ? parentId : undefined,
      relType
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isFirstPerson ? 'Begin Family Tree' : 'Add Family Member'}
            </h2>
            <p className="text-sm text-slate-500">Record the details of your ancestor.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ICONS.Close />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!isFirstPerson && (
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Relationship Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="relType" 
                    checked={relType === 'CHILD'} 
                    onChange={() => setRelType('CHILD')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Child</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="relType" 
                    checked={relType === 'SPOUSE'} 
                    onChange={() => setRelType('SPOUSE')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Spouse</span>
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input 
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Enter name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Gender</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Birth Date</label>
              <input 
                required
                type="date"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.birthDate}
                onChange={e => setFormData({...formData, birthDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Death Date (Optional)</label>
              <input 
                type="date"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.deathDate}
                onChange={e => setFormData({...formData, deathDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Biography</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell their story..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">Save Person</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
