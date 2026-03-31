import { useEffect, useState } from 'react';
import { useCopywriters } from '@/hooks/useCopywriters';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Sparkles, CheckCircle2, XCircle, Quote } from 'lucide-react';
import ProfileToggle from '@/components/ProfileToggle';

function CopywriterSheet({ cw, open, onClose }: { cw: any; open: boolean; onClose: () => void }) {
  const samplesQuery = useQuery({
    queryKey: ['copywriter_samples', cw?.id],
    enabled: !!cw?.id && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('copywriter_samples')
        .select('*')
        .eq('copywriter_id', cw.id)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!cw) return null;

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-left">{cw.name}</SheetTitle>
              {cw.era && <p className="text-xs text-muted-foreground">{cw.era}</p>}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">
            {cw.notes && (
              <div>
                <p className="text-sm font-semibold mb-2">Sobre</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{cw.notes}</p>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Estilo de Escrita
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {cw.style_guide_text}
              </p>
            </div>

            {(cw.dos || cw.donts) && (
              <>
                <Separator />
                <div className="grid grid-cols-1 gap-4">
                  {cw.dos && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Faça
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6 leading-relaxed">{cw.dos}</p>
                    </div>
                  )}
                  {cw.donts && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                        <XCircle className="h-4 w-4" /> Não faça
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6 leading-relaxed">{cw.donts}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {samplesQuery.data && samplesQuery.data.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Quote className="h-4 w-4 text-primary" /> Exemplos de Copies
                  </p>
                  <div className="space-y-3">
                    {samplesQuery.data.map((sample: any) => (
                      <div key={sample.id} className="rounded-xl bg-muted/50 p-4 space-y-1.5">
                        {sample.title && (
                          <p className="text-xs font-semibold text-foreground">{sample.title}</p>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {sample.body}
                        </p>
                        {sample.source && (
                          <p className="text-xs text-muted-foreground/60">Fonte: {sample.source}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {samplesQuery.isLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando exemplos...</p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default function CopywritersPage() {
  const [profile, setProfile] = useState<'company' | 'ceo'>('company');
  const { copywriters, preferences, isLoading, ensurePreferences, toggleActive } = useCopywriters(profile);
  const [selectedCw, setSelectedCw] = useState<any>(null);

  useEffect(() => {
    if (copywriters.length > 0 && !isLoading) {
      ensurePreferences.mutate();
    }
  }, [copywriters.length, isLoading, profile]);

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Copywriters</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ative estilos para geração. Clique em <strong>Ver estilo</strong> para conhecer cada copywriter.
        </p>
      </div>

      <ProfileToggle value={profile} onChange={setProfile} />

      <div className="space-y-3">
        {copywriters.map(cw => {
          const pref = preferences.find(p => p.copywriter_id === cw.id);
          const isActive = pref?.is_active !== false;

          return (
            <Card key={cw.id} className="shadow-apple-sm">
              <CardContent className="flex items-start gap-4 py-4">
                <Switch
                  checked={isActive}
                  onCheckedChange={val => {
                    if (pref) toggleActive.mutate({ prefId: pref.id, isActive: val });
                  }}
                  disabled={!pref}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{cw.name}</p>
                    {cw.era && <Badge variant="secondary" className="text-xs">{cw.era}</Badge>}
                  </div>
                  {cw.notes && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cw.notes}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-lg text-xs"
                  onClick={() => setSelectedCw(cw)}
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  Ver estilo
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CopywriterSheet
        cw={selectedCw}
        open={!!selectedCw}
        onClose={() => setSelectedCw(null)}
      />
    </div>
  );
}
