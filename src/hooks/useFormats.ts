import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Format {
  id: string;
  owner_id: string;
  name: string;
  value: string;
  prompt_instructions: string;
  channels: string[] | null;
  has_script_output: boolean;
  created_at: string;
  updated_at: string;
}

interface FormatInput {
  name: string;
  value: string;
  prompt_instructions: string;
  channels: string[] | null;
  has_script_output: boolean;
}

export function useFormats() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ['formats', user?.id];

  const { data: formats = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formats')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Format[];
    },
  });

  const create = useMutation({
    mutationFn: async (input: FormatInput) => {
      const { error } = await supabase.from('formats').insert({
        ...input,
        owner_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const update = useMutation({
    mutationFn: async (input: FormatInput & { id: string }) => {
      const { id, ...rest } = input;
      const { error } = await supabase.from('formats').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formats').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { formats, isLoading, create, update, remove };
}
