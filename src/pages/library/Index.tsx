import { useState } from 'react';
import { useApprovedCopies } from '@/hooks/useApprovedCopies';
import { useProducts } from '@/hooks/useProducts';
import FiltersBar from '@/components/FiltersBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, Pencil, Trash2 } from 'lucide-react';

export default function LibraryPage() {
  const [filters, setFilters] = useState<any>({});
  const { copies, isLoading, update, remove } = useApprovedCopies(filters);
  const { products } = useProducts();
  const [editItem, setEditItem] = useState<any>(null);
  const [editBody, setEditBody] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editNotes, setEditNotes] = useState('');

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

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Biblioteca de Copies</h1>

      <FiltersBar filters={filters} onChange={setFilters} products={products} />

      {copies.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma copy aprovada ainda.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {copies.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {item.title && <p className="font-medium text-foreground">{item.title}</p>}
                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{item.body}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(item.body)}><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{item.channel}</Badge>
                  <Badge variant="outline">{item.objective}</Badge>
                  <Badge variant="outline">{item.copy_type}</Badge>
                  {(item.tags ?? []).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
    </div>
  );
}
