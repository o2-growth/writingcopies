import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EditorialLineInput } from '@/lib/validators';

export function useEditorialLines(profile?: 'company' | 'ceo') {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['editorial_lines', profile],
    queryFn: async () => {
      let q = supabase
        .from('editorial_lines')
        .select('*')
        .order('created_at', { ascending: false });
      if (profile) q = q.eq('profile', profile);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (input: EditorialLineInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await (supabase
        .from('editorial_lines') as any)
        .insert({ ...input, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['editorial_lines'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...input }: EditorialLineInput & { id: string }) => {
      const { data, error } = await supabase
        .from('editorial_lines')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['editorial_lines'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('editorial_lines').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['editorial_lines'] }),
  });

  return { editorialLines: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}
