import { useState } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FIELD_LABELS: Record<string, string> = {
  title: 'Título',
  subtitle: 'Subtítulo',
  body: 'Corpo',
  cta: 'CTA',
  script: 'Roteiro',
  caption: 'Legenda',
  headline: 'Headline',
  primary_text: 'Texto Principal',
  description: 'Descrição',
  slides: 'Slides',
};

function formatFieldLabel(key: string): string {
  return FIELD_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function renderFieldValue(value: any): React.ReactNode {
  if (Array.isArray(value)) {
    return (
      <div className="space-y-1 pl-3 border-l-2 border-border">
        {value.map((item, i) => (
          <div key={i}>
            {typeof item === 'object' && item !== null
              ? Object.entries(item).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-muted-foreground">{formatFieldLabel(k)}: </span>
                    <span>{String(v)}</span>
                  </div>
                ))
              : <span>{String(item)}</span>}
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <span className="text-muted-foreground">{formatFieldLabel(k)}: </span>
            <span>{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span className="whitespace-pre-wrap">{String(value)}</span>;
}

export default function HistoryPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useHistory(page);
  const [detail, setDetail] = useState<any>(null);

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Histórico de Gerações</h1>

      {items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma geração ainda.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((gen: any) => (
            <Card key={gen.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setDetail(gen)}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {gen.products?.name || 'Sem produto'}
                    </p>
                    <Badge variant="outline">{gen.channel}</Badge>
                    <Badge variant="secondary">{gen.objective}</Badge>
                    {gen.format && <Badge variant="outline" className="border-primary/40 text-primary">{gen.format}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {gen.quantity} copy(ies)
                    {gen.cwa?.name && ` • ${gen.cwa.name}`}
                    {gen.cwb?.name && ` + ${gen.cwb.name}`}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(gen.created_at).toLocaleDateString('pt-BR')}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={v => !v && setDetail(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Geração</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Canal:</span> {detail.channel}</div>
                <div><span className="text-muted-foreground">Objetivo:</span> {detail.objective}</div>
                {detail.format && <div><span className="text-muted-foreground">Formato:</span> {detail.format}</div>}
              </div>
              {(detail.result_json as any)?.copies?.map((copy: any, i: number) => {
                const { caption, ...mainFields } = copy;
                const fields = Object.entries(mainFields).filter(([, v]) => v != null && v !== '');
                return (
                  <Card key={i}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Copy #{i + 1}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {fields.map(([key, value]) => (
                        <div key={key}>
                          <span className="text-xs font-semibold text-muted-foreground uppercase">{formatFieldLabel(key)}</span>
                          <div>{renderFieldValue(value)}</div>
                        </div>
                      ))}
                      {caption && (
                        <div className="mt-2 border-t border-border pt-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Legenda</span>
                          <p className="whitespace-pre-wrap">{String(caption)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
