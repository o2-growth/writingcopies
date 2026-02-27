import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CompanySettingsInput } from '@/lib/validators';

export function useCompany() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['company_settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (input: CompanySettingsInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await (supabase
        .from('company_settings') as any)
        .upsert({ ...input, owner_id: user.id, updated_at: new Date().toISOString() }, { onConflict: 'owner_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company_settings'] }),
  });

  return { company: query.data, isLoading: query.isLoading, upsert };
}
