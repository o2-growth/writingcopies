import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEditorialLines } from '@/hooks/useEditorialLines';
import { editorialLineSchema, type EditorialLineInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProfileToggle from '@/components/ProfileToggle';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import ChampionExamplesEditor from '@/components/ChampionExamplesEditor';

export default function EditorialLines() {
  const [profile, setProfile] = useState<'company' | 'ceo'>('company');
  const { editorialLines, isLoading, create, update, remove } = useEditorialLines(profile);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditorialLineInput>({
    resolver: zodResolver(editorialLineSchema),
  });

  const openNew = () => {
    setEditId(null);
    reset({ profile, name: '', objective: '', content_style: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id);
    reset({
      profile: item.profile ?? profile,
      name: item.name,
      objective: item.objective ?? '',
      content_style: item.content_style ?? '',
      champion_examples: item.champion_examples ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: EditorialLineInput) => {
    try {
      if (editId) {
        await update.mutateAsync({ ...data, id: editId });
        toast.success('Linha editorial atualizada!');
      } else {
        await create.mutateAsync(data);
        toast.success('Linha editorial criada!');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta linha editorial?')) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Linha editorial excluída!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Linha Editorial</h1>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Nova Linha</Button>
      </div>

      <ProfileToggle value={profile} onChange={setProfile} />

      {editorialLines.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma linha editorial para este perfil. Crie a primeira!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {editorialLines.map(item => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  {item.objective && <p className="text-sm text-muted-foreground line-clamp-1">{item.objective}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Linha Editorial' : 'Nova Linha Editorial'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2"><Label>Objetivo</Label><Textarea {...register('objective')} rows={2} /></div>
            <div className="space-y-2"><Label>Estilo do Conteúdo</Label><Textarea {...register('content_style')} rows={3} /></div>
            <div className="space-y-2"><Label>Exemplos de Copies Campeãs</Label><Textarea {...register('champion_examples')} rows={5} /></div>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {editId ? 'Salvar' : 'Criar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
