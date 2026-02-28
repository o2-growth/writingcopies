import { useState } from 'react';
import { useApprovedCopies } from '@/hooks/useApprovedCopies';
import { useProducts } from '@/hooks/useProducts';
import { useChampions } from '@/hooks/useChampions';
import FiltersBar from '@/components/FiltersBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, Pencil, Trash2, Trophy, Crown } from 'lucide-react';
import { FORMATS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function LibraryPage() {
  const [filters, setFilters] = useState<any>({});
  const { copies, isLoading, update, remove } = useApprovedCopies(filters);
  const { products } = useProducts();
  const { championCopyIds, markChampion } = useChampions();

  const [editItem, setEditItem] = useState<any>(null);
  const [editBody, setEditBody] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Champion modal state
  const [championModal, setChampionModal] = useState<{ open: boolean; copy: any }>({ open: false, copy: null });
  const [championFormat, setChampionFormat] = useState<'video' | 'static'>('video');

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setEditBody(item.body);
    setEditTags((item.tags ?? []).join(', '));
    setEditNotes(item.notes ?? '');
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      await update.mutateAsync({
        id: editItem.id,
        body: editBody,
        tags: editTags.split(',').map((t: string) => t.trim()).filter(Boolean),
        notes: editNotes,
      });
      toast.success('Atualizado!');
      setEditItem(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta copy?')) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Excluída!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openChampionModal = (item: any) => {
    // Pre-select format based on copy's existing format if set
    if (item.format) setChampionFormat(item.format);
    setChampionModal({ open: true, copy: item });
  };

  const handleMarkChampion = async () => {
    const { copy } = championModal;
    if (!copy) return;
    try {
      await markChampion.mutateAsync({
        copyId: copy.id,
        productId: copy.product_id ?? null,
        channel: copy.channel,
        format: championFormat,
      });
      toast.success('Copy marcada como campeã!');
      setChampionModal({ open: false, copy: null });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Biblioteca de Copies</h1>

      <FiltersBar filters={filters} onChange={setFilters} products={products} />

      {copies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma copy aprovada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {copies.map((item: any) => {
            const isChampion = championCopyIds.has(item.id);
            return (
              <Card key={item.id} className={cn('shadow-apple-sm transition-all', isChampion && 'ring-2 ring-amber-400 dark:ring-amber-500')}>
                <CardContent className="py-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isChampion && (
                          <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                        {item.title && <p className="font-medium text-foreground">{item.title}</p>}
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{item.body}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Marcar como campeã"
                        className={cn('rounded-xl', isChampion && 'text-amber-500')}
                        onClick={() => openChampionModal(item)}
                      >
                        <Trophy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => handleCopy(item.body)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{item.channel}</Badge>
                    <Badge variant="outline">{item.objective}</Badge>
                    <Badge variant="outline">{item.copy_type}</Badge>
                    {item.format && (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        {item.format === 'video' ? 'Vídeo' : 'Estático'}
                      </Badge>
                    )}
                    {(item.tags ?? []).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={v => !v && setEditItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Editar Copy</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Corpo</Label>
              <Textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={6} />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="tag1, tag2" />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={update.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Champion modal */}
      <Dialog open={championModal.open} onOpenChange={v => !v && setChampionModal({ open: false, copy: null })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Marcar como Campeã
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Esta copy substituirá a campeã atual na mesma categoria (canal + formato).
            </p>
            <div className="space-y-2">
              <Label>Formato do anúncio</Label>
              <Select value={championFormat} onValueChange={v => setChampionFormat(v as 'video' | 'static')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {championModal.copy && (
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">Canal: <strong>{championModal.copy.channel}</strong></p>
                <p className="text-sm line-clamp-3">{championModal.copy.body}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChampionModal({ open: false, copy: null })}>
              Cancelar
            </Button>
            <Button
              onClick={handleMarkChampion}
              disabled={markChampion.isPending}
              className="gap-2"
            >
              <Trophy className="h-4 w-4" />
              {markChampion.isPending ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
