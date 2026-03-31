import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChampionExampleInput {
  body: string;
  format: string;
  channel: string;
  product_id?: string;
  editorial_line_id?: string;
}

interface UseChampionExamplesFilter {
  product_id?: string;
  editorial_line_id?: string;
}

export function useChampionExamples(filter: UseChampionExamplesFilter) {
  const qc = useQueryClient();
  const key = ['champion_examples', filter.product_id, filter.editorial_line_id];

  const query = useQuery({
    queryKey: key,
    enabled: !!(filter.product_id || filter.editorial_line_id),
    queryFn: async () => {
      let q = supabase.from('champion_examples').select('*').order('created_at', { ascending: false });
      if (filter.product_id) q = q.eq('product_id', filter.product_id);
      if (filter.editorial_line_id) q = q.eq('editorial_line_id', filter.editorial_line_id);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (input: ChampionExampleInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await (supabase.from('champion_examples') as any)
        .insert({ ...input, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('champion_examples').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { examples: query.data ?? [], isLoading: query.isLoading, create, remove };
}
