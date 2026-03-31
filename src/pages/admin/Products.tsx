import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProducts } from '@/hooks/useProducts';
import { productSchema, type ProductInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function Products() {
  const { products, isLoading, create, update, remove } = useProducts();
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
  });

  const openNew = () => {
    setEditId(null);
    reset({ name: '', description: '', benefits: '', features: '', objections: '', pain_points: '', best_ads: '' });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditId(p.id);
    reset({
      name: p.name,
      description: p.description ?? '',
      benefits: p.benefits ?? '',
      features: p.features ?? '',
      objections: p.objections ?? '',
      pain_points: p.pain_points ?? '',
      best_ads: p.best_ads ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ProductInput) => {
    try {
      if (editId) {
        await update.mutateAsync({ ...data, id: editId });
        toast.success('Produto atualizado!');
      } else {
        await create.mutateAsync(data);
        toast.success('Produto criado!');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Produto excluído!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Novo Produto</Button>
      </div>

      {products.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum produto. Crie o primeiro!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-foreground">{p.name}</p>
                  {p.description && <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea {...register('description')} rows={2} /></div>
            <div className="space-y-2"><Label>Benefícios</Label><Textarea {...register('benefits')} rows={2} /></div>
            <div className="space-y-2"><Label>Features</Label><Textarea {...register('features')} rows={2} /></div>
            <div className="space-y-2"><Label>Objeções</Label><Textarea {...register('objections')} rows={2} /></div>
            <div className="space-y-2"><Label>Quais dores resolve</Label><Textarea {...register('pain_points')} rows={2} /></div>
            <div className="space-y-2"><Label>Melhores Anúncios</Label><Textarea {...register('best_ads')} rows={4} placeholder="Cole aqui seus melhores anúncios de referência. Serão usados como inspiração quando o objetivo for conversão, leads ou vendas." /></div>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {editId ? 'Salvar' : 'Criar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
