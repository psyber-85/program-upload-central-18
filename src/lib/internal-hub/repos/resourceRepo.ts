// Doc 4.1 — Supabase-backed resourceRepo.
// Async API. RLS enforces visibility (audience match + active staff + not archived).
// DB lacks `owner`, `isNew` columns — defaulted/derived in mapRow.
import { supabase } from '@/integrations/supabase/client';
import type { NoticeAudience, Resource, ResourceCategory, StaffProfile } from '../types';

type DbResource = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  url: string;
  audience: string;
  archived_at: string | null;
  created_at: string;
};

function audienceToDb(a: NoticeAudience): string {
  if (a.kind === 'Arm' && (a.arm === 'Training' || a.arm === 'Solutions')) return a.arm;
  // 'Everyone', 'Admin', 'Arm: Admin/General', 'Individual' → Everyone
  return 'Everyone';
}

function audienceFromDb(audience: string): NoticeAudience {
  if (audience === 'Training') return { kind: 'Arm', arm: 'Training' };
  if (audience === 'Solutions') return { kind: 'Arm', arm: 'Solutions' };
  return { kind: 'Everyone' };
}

function mapRow(r: DbResource): Resource {
  const external = r.url.startsWith('http');
  return {
    id: r.id,
    title: r.title,
    category: r.category as ResourceCategory,
    link: r.url,
    description: r.description ?? undefined,
    audience: audienceFromDb(r.audience),
    status: r.archived_at ? 'Archived' : 'Active',
    createdAt: r.created_at,
    updatedAt: r.created_at,
    external,
  };
}

export const resourceRepo = {
  async list(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('ih_resources')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as DbResource[]).map(mapRow);
  },

  /** RLS filters audience + archived for non-admins. */
  async visibleFor(_staff: StaffProfile): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('ih_resources')
      .select('*')
      .is('archived_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as DbResource[]).map(mapRow);
  },

  async create(input: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Resource> {
    const { data, error } = await supabase
      .from('ih_resources')
      .insert({
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        url: input.link,
        audience: audienceToDb(input.audience),
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data as DbResource);
  },

  async update(id: string, patch: Partial<Resource>): Promise<Resource | undefined> {
    const dbPatch: Record<string, unknown> = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.link !== undefined) dbPatch.url = patch.link;
    if (patch.audience !== undefined) dbPatch.audience = audienceToDb(patch.audience);
    if (patch.status !== undefined) {
      dbPatch.archived_at = patch.status === 'Archived' ? new Date().toISOString() : null;
    }
    if (Object.keys(dbPatch).length === 0) {
      const { data } = await supabase.from('ih_resources').select('*').eq('id', id).maybeSingle();
      return data ? mapRow(data as DbResource) : undefined;
    }
    const { data, error } = await supabase
      .from('ih_resources')
      .update(dbPatch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data as DbResource);
  },

  async archive(id: string): Promise<void> {
    const { error } = await supabase
      .from('ih_resources')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async unarchive(id: string): Promise<void> {
    const { error } = await supabase
      .from('ih_resources')
      .update({ archived_at: null })
      .eq('id', id);
    if (error) throw error;
  },
};
