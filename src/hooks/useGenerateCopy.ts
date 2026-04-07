import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GenerateCopyInput } from '@/lib/validators';

export function useGenerateCopy() {
  return useMutation({
    mutationFn: async (input: GenerateCopyInput) => {
      const { data, error } = await supabase.functions.invoke('generate-copy', {
        body: input,
      });
      if (error) throw new Error(error.message || 'Erro ao gerar copy');
      return data as {
        copies: Array<Record<string, any>>;
        meta: {
          channel: string;
          objective: string;
          copywriters: string[];
          language: string;
        };
      };
    },
  });
}
