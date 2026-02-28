import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ChampionRecord {
  id: string;
  owner_id: string;
  copy_id: string;
  product_id: string | null;
  channel: string;
  format: 'video' | 'static';
  champion_at: string;
  replaced_at: string | null;
  created_at: string;
  approved_copies?: {
    id: string;
    title: string | null;
    body: string;
    channel: string;
    copy_type: string;
    objective: string;
  };
  products?: { name: string } | null;
}

export function useChampions() {
  const qc = useQueryClient();

  // All active champions (replaced_at IS NULL)
  const activeQuery = useQuery({
    queryKey: ['copy_champions', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('copy_champions')
        .select('*, approved_copies(id, title, body, channel, copy_type, objective), products(name)')
        .is('replaced_at', null)
        .order('champion_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ChampionRecord[];
    },
  });

  // History: all past champions (replaced_at IS NOT NULL)
  const historyQuery = useQuery({
    queryKey: ['copy_champions', 'history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('copy_champions')
        .select('*, approved_copies(id, title, body, channel, copy_type, objective), products(name)')
        .not('replaced_at', 'is', null)
        .order('replaced_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ChampionRecord[];
    },
  });

  // IDs of copies that are currently champion (for badge display in library)
  const championCopyIds = new Set((activeQuery.data ?? []).map(c => c.copy_id));

  // Mark a copy as champion in its category
  const markChampion = useMutation({
    mutationFn: async ({
      copyId,
      productId,
      channel,
      format,
    }: {
      copyId: string;
      productId: string | null;
      channel: string;
      format: 'video' | 'static';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find current active champion for this category
      let q = supabase
        .from('copy_champions')
        .select('id')
        .eq('owner_id', user.id)
        .eq('channel', channel)
        .eq('format', format)
        .is('replaced_at', null);

      if (productId) {
        q = q.eq('product_id', productId);
      } else {
        q = q.is('product_id', null);
      }

      const { data: existing } = await q;

      // Replace previous champion(s)
      if (existing && existing.length > 0) {
        const ids = existing.map((r: any) => r.id);
        const { error: replaceErr } = await supabase
          .from('copy_champions')
          .update({ replaced_at: new Date().toISOString() })
          .in('id', ids);
        if (replaceErr) throw replaceErr;
      }

      // Insert new champion
      const { error } = await supabase
        .from('copy_champions')
        .insert({
          owner_id: user.id,
          copy_id: copyId,
          product_id: productId,
          channel,
          format,
          champion_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['copy_champions'] });
    },
  });

  return {
    activeChampions: activeQuery.data ?? [],
    championHistory: historyQuery.data ?? [],
    championCopyIds,
    isLoading: activeQuery.isLoading,
    isHistoryLoading: historyQuery.isLoading,
    markChampion,
  };
}
