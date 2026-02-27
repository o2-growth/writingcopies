import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useHistory(page = 0, pageSize = 20) {
  return useQuery({
    queryKey: ['generations', page],
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('generations')
        .select('*, products(name), cwa:copywriters!generations_copywriter_a_id_fkey(name), cwb:copywriters!generations_copywriter_b_id_fkey(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { items: data ?? [], total: count ?? 0 };
    },
  });
}
