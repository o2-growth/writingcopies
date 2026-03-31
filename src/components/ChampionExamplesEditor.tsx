import { useState } from 'react';
import { useChampionExamples } from '@/hooks/useChampionExamples';
import { CHANNELS, FORMATS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';

interface Props {
  product_id?: string;
  editorial_line_id?: string;
}

const FORMAT_LABELS: Record<string, string> = { video: 'Vídeo', static: 'Estático', carousel: 'Carrossel' };
const CHANNEL_LABELS: Record<string, string> = Object.fromEntries(CHANNELS.map(c => [c.value, c.label]));

export default function ChampionExamplesEditor({ product_id, editorial_line_id }: Props) {
  const { examples, isLoading, create, remove } = useChampionExamples({ product_id, editorial_line_id });
  const [showForm, setShowForm] = useState(false);
  const [body, setBody] = useState('');
  const [format, setFormat] = useState('');
  const [channel, setChannel] = useState('');

  const handleAdd = async () => {
    if (!body.trim() || !format || !channel) {
      toast.error('Preencha todos os campos do exemplo.');
      return;
    }
    try {
      await create.mutateAsync({ body: body.trim(), format, channel, product_id, editorial_line_id });
      setBody('');
      setFormat('');
      setChannel('');
      setShowForm(false);
      toast.success('Exemplo adicionado!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Exemplo removido!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando exemplos...</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Exemplos de Copies Campeãs</Label>
        {!showForm && (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)} className="gap-1">
            <Plus className="h-3 w-3" /> Adicionar
          </Button>
        )}
      </div>

      {showForm && (
        <div className="border border-border rounded-md p-3 space-y-3 bg-muted/30">
          <Textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={3}
            placeholder="Cole aqui o texto da copy campeã..."
          />
          <div className="grid grid-cols-2 gap-2">
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger><SelectValue placeholder="Formato" /></SelectTrigger>
              <SelectContent>
                {FORMATS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue placeholder="Canal" /></SelectTrigger>
              <SelectContent>
                {CHANNELS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleAdd} disabled={create.isPending}>
              Salvar exemplo
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {examples.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">Nenhum exemplo cadastrado.</p>
      )}

      {examples.map(ex => (
        <div key={ex.id} className="border border-border rounded-md p-3 space-y-2">
          <p className="text-sm text-foreground line-clamp-3">{ex.body}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <Badge variant="secondary" className="text-xs">{FORMAT_LABELS[ex.format] ?? ex.format}</Badge>
              <Badge variant="outline" className="text-xs">{CHANNEL_LABELS[ex.channel] ?? ex.channel}</Badge>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(ex.id)}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
