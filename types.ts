
export type Gender = 'Male' | 'Female' | 'Other';

export type RelationType = 'CHILD' | 'SPOUSE';

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string;
  deathDate?: string;
  bio: string;
  mainImage: string;
  gallery: string[];
  parentId?: string; 
  spouseId?: string;
}

export type UserRole = 'PUBLIC' | 'BRANCH_ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedBranchId?: string;
}

export interface TreeData extends Person {
  children?: TreeData[];
}
