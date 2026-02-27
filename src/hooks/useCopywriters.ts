import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCopywriters() {
  const qc = useQueryClient();

  const presetsQuery = useQuery({
    queryKey: ['copywriters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('copywriters')
        .select('*')
        .eq('is_preset', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const prefsQuery = useQuery({
    queryKey: ['copywriter_preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('copywriter_preferences')
        .select('*')
        .eq('owner_id', user.id);
      if (error) throw error;
      return data;
    },
  });

  const ensurePreferences = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const copywriters = presetsQuery.data;
      if (!copywriters?.length) return;
      
      const existing = prefsQuery.data ?? [];
      const existingIds = new Set(existing.map(p => p.copywriter_id));
      const missing = copywriters.filter(c => !existingIds.has(c.id));
      
      if (missing.length > 0) {
        const { error } = await supabase
          .from('copywriter_preferences')
          .insert(missing.map(c => ({ owner_id: user.id, copywriter_id: c.id, is_active: true })));
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['copywriter_preferences'] }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ prefId, isActive }: { prefId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('copywriter_preferences')
        .update({ is_active: isActive })
        .eq('id', prefId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['copywriter_preferences'] }),
  });

  const activeCopywriters = (presetsQuery.data ?? []).filter(c => {
    const pref = (prefsQuery.data ?? []).find(p => p.copywriter_id === c.id);
    return pref?.is_active !== false;
  });

  return {
    copywriters: presetsQuery.data ?? [],
    preferences: prefsQuery.data ?? [],
    activeCopywriters,
    isLoading: presetsQuery.isLoading || prefsQuery.isLoading,
    ensurePreferences,
    toggleActive,
  };
}
