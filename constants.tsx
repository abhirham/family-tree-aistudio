
import React from 'react';
import { Person } from './types';

export const INITIAL_DATA: Person[] = [
  {
    id: 'root-1',
    name: 'George Harrison Sr.',
    gender: 'Male',
    birthDate: '1920-05-12',
    deathDate: '1995-11-20',
    bio: 'The patriarch of the Harrison family. A decorated veteran and master carpenter who built the family estate by hand.',
    mainImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
  },
  // Martha's Branch
  {
    id: 'child-1',
    name: 'Martha Harrison-Vance',
    gender: 'Female',
    birthDate: '1945-08-22',
    bio: 'A visionary educator who served as Dean of Arts. Known for her love of classical literature and gardening.',
    mainImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    parentId: 'root-1',
    spouseId: 'spouse-martha',
  },
  {
    id: 'spouse-martha',
    name: 'Dr. Robert Vance',
    gender: 'Male',
    birthDate: '1942-03-10',
    deathDate: '2015-06-14',
    bio: 'A renowned surgeon and amateur cellist. He met Martha during a faculty mixer in 1968.',
    mainImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    spouseId: 'child-1',
  },
  {
    id: 'martha-child-1',
    name: 'Sarah Vance',
    gender: 'Female',
    birthDate: '1970-11-05',
    bio: 'An environmental lawyer based in Portland. She continues her mother\'s legacy of community service.',
    mainImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    parentId: 'child-1',
  },
  // Arthur's Branch
  {
    id: 'child-2',
    name: 'Arthur Harrison',
    gender: 'Male',
    birthDate: '1948-03-15',
    bio: 'A passionate architect who specialized in sustainable urban design. He spent decades traveling the world.',
    mainImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    parentId: 'root-1',
    spouseId: 'spouse-arthur',
  },
  {
    id: 'spouse-arthur',
    name: 'Evelyn Thorne',
    gender: 'Female',
    birthDate: '1952-12-01',
    bio: 'A professional landscape photographer. Her work often captured the serenity of the family\'s country home.',
    mainImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    spouseId: 'child-2',
  },
  // Arthur's 5 Children
  {
    id: 'arthur-child-1',
    name: 'Lily Harrison',
    gender: 'Female',
    birthDate: '1975-06-12',
    bio: 'An interior designer who brings warmth and modern aesthetics to every project.',
    mainImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    parentId: 'child-2',
  },
  {
    id: 'arthur-child-2',
    name: 'David Harrison',
    gender: 'Male',
    birthDate: '1978-09-22',
    bio: 'A commercial pilot with a love for high-altitude photography.',
    mainImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    parentId: 'child-2',
  },
  {
    id: 'arthur-child-3',
    name: 'Michael Harrison',
    gender: 'Male',
    birthDate: '1982-02-14',
    bio: 'Software engineer and tech enthusiast. Founder of several successful startups.',
    mainImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    parentId: 'child-2',
  },
  {
    id: 'arthur-child-4',
    name: 'Claire Harrison',
    gender: 'Female',
    birthDate: '1985-05-30',
    bio: 'A dedicated marine biologist working on coral reef restoration.',
    mainImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    parentId: 'child-2',
  },
  {
    id: 'arthur-child-5',
    name: 'Sophia Harrison',
    gender: 'Female',
    birthDate: '1988-11-11',
    bio: 'An accomplished pastry chef and owner of "The Sweet Legacy" bakery.',
    mainImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    parentId: 'child-2',
  },
  // Grandchild from Michael
  {
    id: 'michael-child-1',
    name: 'Oliver Harrison',
    gender: 'Male',
    birthDate: '2015-07-04',
    bio: 'A curious and energetic young boy who loves building with blocks and drawing.',
    mainImage: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=400&h=400',
    gallery: [],
    parentId: 'arthur-child-3',
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
  ),
  Terminal: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
  )
};
