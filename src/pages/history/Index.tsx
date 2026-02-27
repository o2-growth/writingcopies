import { useState } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
                    <Badge variant="secondary">{gen.copy_type}</Badge>
                    <Badge variant="outline">{gen.channel}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {gen.quantity} copy(ies) • {gen.size} • {gen.objective}
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
                <div><span className="text-muted-foreground">Tipo:</span> {detail.copy_type}</div>
                <div><span className="text-muted-foreground">Tamanho:</span> {detail.size}</div>
              </div>
              {(detail.result_json as any)?.copies?.map((copy: any, i: number) => (
                <Card key={i}>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Copy #{i + 1}</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {copy.title && <div><span className="text-muted-foreground">Título:</span> {copy.title}</div>}
                    {copy.subtitle && <div><span className="text-muted-foreground">Subtítulo:</span> {copy.subtitle}</div>}
                    {copy.body && <div><span className="text-muted-foreground">Corpo:</span> <span className="whitespace-pre-wrap">{copy.body}</span></div>}
                    {copy.cta && <div><span className="text-muted-foreground">CTA:</span> {copy.cta}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
