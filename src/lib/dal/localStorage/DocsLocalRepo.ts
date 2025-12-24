import { DocsRepo } from '../interfaces/DocsRepo';
import { DocLink } from '../types';
import { delay, generateId, now, storageGet, storageSet } from '../utils';
import { seedDocs } from '../seed/seedData';

const DOCS_KEY = 'docs';

export class DocsLocalRepo implements DocsRepo {
  private getDocs(): DocLink[] {
    return storageGet<DocLink[]>(DOCS_KEY, seedDocs);
  }

  private saveDocs(docs: DocLink[]): void {
    storageSet(DOCS_KEY, docs);
  }

  async getAllDocs(): Promise<DocLink[]> {
    await delay();
    return this.getDocs().sort((a, b) => a.title.localeCompare(b.title));
  }

  async getDocsByCategory(category: string): Promise<DocLink[]> {
    await delay();
    return this.getDocs()
      .filter(d => d.category === category)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async getDocById(id: string): Promise<DocLink | null> {
    await delay();
    return this.getDocs().find(d => d.id === id) || null;
  }

  async searchDocs(query: string): Promise<DocLink[]> {
    await delay();
    const lowerQuery = query.toLowerCase();
    return this.getDocs().filter(d => 
      d.title.toLowerCase().includes(lowerQuery) ||
      d.description?.toLowerCase().includes(lowerQuery) ||
      d.category.toLowerCase().includes(lowerQuery)
    );
  }

  async createDoc(doc: Omit<DocLink, 'id' | 'createdAt'>): Promise<DocLink> {
    await delay();
    const docs = this.getDocs();
    
    const newDoc: DocLink = {
      ...doc,
      id: generateId(),
      createdAt: now(),
    };
    
    docs.push(newDoc);
    this.saveDocs(docs);
    
    return newDoc;
  }

  async updateDoc(id: string, updates: Partial<DocLink>): Promise<DocLink | null> {
    await delay();
    const docs = this.getDocs();
    const index = docs.findIndex(d => d.id === id);
    
    if (index === -1) {
      return null;
    }
    
    docs[index] = { ...docs[index], ...updates };
    this.saveDocs(docs);
    
    return docs[index];
  }

  async deleteDoc(id: string): Promise<boolean> {
    await delay();
    const docs = this.getDocs();
    const filtered = docs.filter(d => d.id !== id);
    
    if (filtered.length === docs.length) {
      return false;
    }
    
    this.saveDocs(filtered);
    return true;
  }

  async getCategories(): Promise<string[]> {
    await delay();
    const docs = this.getDocs();
    const categories = [...new Set(docs.map(d => d.category))];
    return categories.sort();
  }
}

export const docsLocalRepo = new DocsLocalRepo();
