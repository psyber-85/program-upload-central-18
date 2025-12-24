import { DocLink } from '../types';

export interface DocsRepo {
  // Get all documents
  getAllDocs(): Promise<DocLink[]>;
  
  // Get documents by category
  getDocsByCategory(category: string): Promise<DocLink[]>;
  
  // Get document by ID
  getDocById(id: string): Promise<DocLink | null>;
  
  // Search documents
  searchDocs(query: string): Promise<DocLink[]>;
  
  // Create document (admin)
  createDoc(doc: Omit<DocLink, 'id' | 'createdAt'>): Promise<DocLink>;
  
  // Update document (admin)
  updateDoc(id: string, updates: Partial<DocLink>): Promise<DocLink | null>;
  
  // Delete document (admin)
  deleteDoc(id: string): Promise<boolean>;
  
  // Get all categories
  getCategories(): Promise<string[]>;
}
