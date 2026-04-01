import { useState } from 'react';
import { useFormats, type Format } from '@/hooks/useFormats';
import { CHANNELS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

const CHANNEL_LABELS: Record<string, string> = Object.fromEntries(CHANNELS.map(c => [c.value, c.label]));

interface FormData {
  name: string;
  value: string;
  prompt_instructions: string;
  channels: string[];
  has_script_output: boolean;
}

const emptyForm: FormData = { name: '', value: '', prompt_instructions: '', channels: [], has_script_output: false };

export default function FormatsPage() {
  const { formats, isLoading, create, update, remove } = useFormats();
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);

  const openNew = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (f: Format) => {
    setEditId(f.id);
    setForm({
      name: f.name,
      value: f.value,
      prompt_instructions: f.prompt_instructions,
      channels: f.channels ?? [],
      has_script_output: f.has_script_output,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.value.trim()) {
      toast.error('Nome e slug são obrigatórios.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      value: form.value.trim().toLowerCase(),
      prompt_instructions: form.prompt_instructions.trim(),
      channels: form.channels.length > 0 ? form.channels : null,
      has_script_output: form.has_script_output,
    };
    try {
      if (editId) {
        await update.mutateAsync({ ...payload, id: editId });
        toast.success('Formato atualizado!');
      } else {
        await create.mutateAsync(payload);
        toast.success('Formato criado!');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este formato?')) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Formato excluído!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleChannel = (ch: string) => {
    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter(c => c !== ch)
        : [...prev.channels, ch],
    }));
  };

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Formatos</h1>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Novo Formato</Button>
      </div>

      {formats.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum formato. Crie o primeiro!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {formats.map(f => (
            <Card key={f.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{f.name} <span className="text-muted-foreground text-sm">({f.value})</span></p>
                  <div className="flex gap-1 flex-wrap">
                    {f.has_script_output && <Badge variant="secondary" className="text-xs">Roteiro</Badge>}
                    {f.channels?.map(ch => (
                      <Badge key={ch} variant="outline" className="text-xs">{CHANNEL_LABELS[ch] ?? ch}</Badge>
                    ))}
                    {!f.channels && <Badge variant="outline" className="text-xs">Todos os canais</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Formato' : 'Novo Formato'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Carrossel" />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="Ex: carousel" />
              <p className="text-xs text-muted-foreground">Identificador único (sem espaços, minúsculas)</p>
            </div>
            <div className="space-y-2">
              <Label>Instruções do Prompt</Label>
              <Textarea
                value={form.prompt_instructions}
                onChange={e => setForm(p => ({ ...p, prompt_instructions: e.target.value }))}
                rows={8}
                placeholder="Regras estruturais que serão injetadas no prompt da IA para este formato..."
              />
              <p className="text-xs text-muted-foreground">Descreva as regras de estrutura, quantidade de slides, marcações de cena, etc.</p>
            </div>
            <div className="space-y-2">
              <Label>Canais Permitidos</Label>
              <p className="text-xs text-muted-foreground">Deixe vazio para todos os canais</p>
              <div className="flex flex-wrap gap-3">
                {CHANNELS.map(ch => (
                  <label key={ch.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.channels.includes(ch.value)}
                      onCheckedChange={() => toggleChannel(ch.value)}
                    />
                    {ch.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.has_script_output}
                onCheckedChange={v => setForm(p => ({ ...p, has_script_output: v }))}
              />
              <Label>Saída em Roteiro (script)</Label>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Ative para formatos como vídeo, onde a saída é um roteiro em vez de título/subtítulo/corpo/CTA.
            </p>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {editId ? 'Salvar' : 'Criar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
