import { supabase } from '@/integrations/supabase/client';
import { DocLink } from '../types';
import { DocsRepo } from '../interfaces/DocsRepo';

class DocsSupabaseRepo implements DocsRepo {

  async getAllDocs(): Promise<DocLink[]> {
    const { data, error } = await supabase
      .from('sp_doc_links')
      .select('*')
      .order('category')
      .order('title');

    if (error || !data) return [];

    return data.map(this.mapDocLink);
  }

  async getDocsByCategory(category: string): Promise<DocLink[]> {
    const { data, error } = await supabase
      .from('sp_doc_links')
      .select('*')
      .eq('category', category)
      .order('title');

    if (error || !data) return [];

    return data.map(this.mapDocLink);
  }

  async getDocById(id: string): Promise<DocLink | null> {
    const { data, error } = await supabase
      .from('sp_doc_links')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return this.mapDocLink(data);
  }

  async searchDocs(query: string): Promise<DocLink[]> {
    const { data, error } = await supabase
      .from('sp_doc_links')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('title');

    if (error || !data) return [];

    return data.map(this.mapDocLink);
  }

  async createDoc(doc: Omit<DocLink, 'id' | 'createdAt'>): Promise<DocLink> {
    const { data, error } = await supabase
      .from('sp_doc_links')
      .insert({
        title: doc.title,
        category: doc.category,
        url: doc.url,
        description: doc.description,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapDocLink(data);
  }

  async updateDoc(id: string, updates: Partial<DocLink>): Promise<DocLink | null> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.description !== undefined) updateData.description = updates.description;

    const { error } = await supabase
      .from('sp_doc_links')
      .update(updateData)
      .eq('id', id);

    if (error) return null;

    return this.getDocById(id);
  }

  async deleteDoc(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sp_doc_links')
      .delete()
      .eq('id', id);

    return !error;
  }

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('sp_doc_links')
      .select('category')
      .order('category');

    if (error || !data) return [];

    // Get unique categories
    const categories = [...new Set(data.map(d => d.category))];
    return categories;
  }

  private mapDocLink(data: Record<string, unknown>): DocLink {
    return {
      id: data.id as string,
      title: data.title as string,
      category: data.category as string,
      url: data.url as string,
      description: data.description as string | undefined,
      createdAt: data.created_at as string,
    };
  }
}

export const docsSupabaseRepo = new DocsSupabaseRepo();
