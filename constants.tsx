
import React from 'react';
import { Person } from './types';

export const INITIAL_DATA: Person[] = [
  {
    id: 'root-1',
    name: 'George Harrison Sr.',
    gender: 'Male',
    birthDate: '1920-05-12',
    deathDate: '1995-11-20',
    bio: 'The patriarch of the Harrison family. Known for his resilience and wisdom.',
    mainImage: 'https://picsum.photos/seed/george/400/400',
    gallery: ['https://picsum.photos/seed/george1/600/400', 'https://picsum.photos/seed/george2/600/400'],
  },
  {
    id: 'child-1',
    name: 'Martha Harrison',
    gender: 'Female',
    birthDate: '1945-08-22',
    bio: 'A brilliant educator who dedicated her life to community service.',
    mainImage: 'https://picsum.photos/seed/martha/400/400',
    gallery: [],
    parentId: 'root-1',
  },
  {
    id: 'child-2',
    name: 'Arthur Harrison',
    gender: 'Male',
    birthDate: '1948-03-15',
    bio: 'A passionate architect and traveler.',
    mainImage: 'https://picsum.photos/seed/arthur/400/400',
    gallery: [],
    parentId: 'root-1',
  },
  {
    id: 'gchild-1',
    name: 'Lily Harrison',
    gender: 'Female',
    birthDate: '1975-12-01',
    bio: 'Followed in her father Arthur\'s footsteps as a modern architect.',
    mainImage: 'https://picsum.photos/seed/lily/400/400',
    gallery: [],
    parentId: 'child-2',
  }
];

export const ICONS = {
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  ),
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  )
};
