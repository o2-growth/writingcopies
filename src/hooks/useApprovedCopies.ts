import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Filters {
  channel?: string;
  objective?: string;
  copy_type?: string;
  product_id?: string;
}

export function useApprovedCopies(filters: Filters = {}) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['approved_copies', filters],
    queryFn: async () => {
      let q = supabase
        .from('approved_copies')
        .select('*, products(name)')
        .order('created_at', { ascending: false });
      if (filters.channel) q = q.eq('channel', filters.channel);
      if (filters.objective) q = q.eq('objective', filters.objective);
      if (filters.copy_type) q = q.eq('copy_type', filters.copy_type);
      if (filters.product_id) q = q.eq('product_id', filters.product_id);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const approve = useMutation({
    mutationFn: async (input: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('approved_copies')
        .insert({ ...input, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approved_copies'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const { error } = await supabase
        .from('approved_copies')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approved_copies'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('approved_copies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approved_copies'] }),
  });

  return { copies: query.data ?? [], isLoading: query.isLoading, approve, update, remove };
}
