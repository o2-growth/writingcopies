import { useEffect } from 'react';
import { useCopywriters } from '@/hooks/useCopywriters';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export default function CopywritersPage() {
  const { copywriters, preferences, isLoading, ensurePreferences, toggleActive } = useCopywriters();

  useEffect(() => {
    if (copywriters.length > 0 && !isLoading) {
      ensurePreferences.mutate();
    }
  }, [copywriters.length, isLoading]);

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Copywriters</h1>
        <p className="text-muted-foreground text-sm mt-1">Ative ou desative os estilos disponíveis para geração.</p>
      </div>

      <div className="space-y-3">
        {copywriters.map(cw => {
          const pref = preferences.find(p => p.copywriter_id === cw.id);
          const isActive = pref?.is_active !== false;

          return (
            <Card key={cw.id}>
              <CardContent className="flex items-start gap-4 py-4">
                <Switch
                  checked={isActive}
                  onCheckedChange={val => {
                    if (pref) toggleActive.mutate({ prefId: pref.id, isActive: val });
                  }}
                  disabled={!pref}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{cw.name}</p>
                    {cw.era && <Badge variant="secondary" className="text-xs">{cw.era}</Badge>}
                  </div>
                  {cw.notes && <p className="text-sm text-muted-foreground mt-1">{cw.notes}</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
