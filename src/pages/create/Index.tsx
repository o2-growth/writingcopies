import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateCopySchema, type GenerateCopyInput } from '@/lib/validators';
import { COPY_TYPES, SIZES, OBJECTIVES, CHANNELS, FORMATS } from '@/lib/constants';
import { useProducts } from '@/hooks/useProducts';
import { useCopywriters } from '@/hooks/useCopywriters';
import { useCompany } from '@/hooks/useCompany';
import { useEditorialLines } from '@/hooks/useEditorialLines';
import { useGenerateCopy } from '@/hooks/useGenerateCopy';
import { useApprovedCopies } from '@/hooks/useApprovedCopies';
import CopyResultCard from '@/components/CopyResultCard';
import ApprovedCopyModal from '@/components/ApprovedCopyModal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function CreatePage() {
  const { products } = useProducts();
  const { activeCopywriters } = useCopywriters();
  const { company } = useCompany();
  const { editorialLines } = useEditorialLines();
  const generate = useGenerateCopy();
  const { approve } = useApprovedCopies();

  const [results, setResults] = useState<any>(null);
  const [lastInput, setLastInput] = useState<GenerateCopyInput | null>(null);
  const [approveModal, setApproveModal] = useState<{ open: boolean; copy: any }>({ open: false, copy: null });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<GenerateCopyInput>({
    resolver: zodResolver(generateCopySchema),
    defaultValues: {
      copywriter_ids: [],
      quantity: 1,
      copy_type: 'completa',
      size: 'M',
      objective: 'conversao',
      channel: 'instagram',
      format: undefined,
    },
  });

  const selectedCopywriters = watch('copywriter_ids') ?? [];

  const toggleCopywriter = (id: string) => {
    const current = selectedCopywriters;
    if (current.includes(id)) {
      setValue('copywriter_ids', current.filter(c => c !== id));
    } else if (current.length < 2) {
      setValue('copywriter_ids', [...current, id]);
    } else {
      toast.error('Máximo 2 copywriters');
    }
  };

  const onSubmit = async (data: GenerateCopyInput) => {
    try {
      setLastInput(data);
      const result = await generate.mutateAsync(data);
      setResults(result);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar');
    }
  };

  const handleApprove = (copy: any) => {
    setApproveModal({ open: true, copy });
  };

  const handleSaveApproved = async ({ tags, notes }: { tags: string[]; notes: string }) => {
    if (!lastInput || !approveModal.copy) return;
    try {
      const fullBody = [approveModal.copy.title, approveModal.copy.subtitle, approveModal.copy.body, approveModal.copy.cta]
        .filter(Boolean).join('\n\n');
      await approve.mutateAsync({
        title: approveModal.copy.title || null,
        body: fullBody,
        channel: lastInput.channel,
        objective: lastInput.objective,
        copy_type: lastInput.copy_type,
        size: lastInput.size,
        format: lastInput.format || null,
        product_id: lastInput.product_id || null,
        copywriter_a_id: lastInput.copywriter_ids[0] || null,
        copywriter_b_id: lastInput.copywriter_ids[1] || null,
        tags,
        notes,
      });
      toast.success('Copy salva na biblioteca!');
      setApproveModal({ open: false, copy: null });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Configure sua empresa primeiro</h2>
            <p className="text-muted-foreground">Antes de gerar copies, configure a voz da marca e dados da empresa.</p>
            <Link to="/admin/company">
              <Button>Ir para Configurações</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Criar Copy</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure e gere copies com IA.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Produto</Label>
            <Controller
              name="product_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? 'none'} onValueChange={v => field.onChange(v === 'none' ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem produto</SelectItem>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Linha Editorial</Label>
            <Controller
              name="editorial_line_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? 'none'} onValueChange={v => field.onChange(v === 'none' ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar linha editorial" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem linha editorial</SelectItem>
                    {editorialLines.map(el => <SelectItem key={el.id} value={el.id}>{el.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Canal</Label>
            <Controller
              name="channel"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Objetivo</Label>
            <Controller
              name="objective"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OBJECTIVES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Controller
              name="copy_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COPY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Tamanho</Label>
            <Controller
              name="size"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SIZES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={v => field.onChange(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 copy</SelectItem>
                    <SelectItem value="2">2 copies</SelectItem>
                    <SelectItem value="3">3 copies</SelectItem>
                    <SelectItem value="4">4 copies</SelectItem>
                    <SelectItem value="5">5 copies</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Formato</Label>
            <Controller
              name="format"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? 'none'} onValueChange={v => field.onChange(v === 'none' ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar formato" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não definir</SelectItem>
                    {FORMATS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Copywriters (máx. 2)</Label>
          <div className="flex flex-wrap gap-2">
            {activeCopywriters.map(cw => (
              <button
                key={cw.id}
                type="button"
                onClick={() => toggleCopywriter(cw.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedCopywriters.includes(cw.id)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border hover:border-primary'
                }`}
              >
                {cw.name}
              </button>
            ))}
          </div>
          {errors.copywriter_ids && <p className="text-sm text-destructive">{errors.copywriter_ids.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Contexto Extra (opcional)</Label>
          <Textarea {...register('extra_context')} rows={3} placeholder="Informações adicionais, promoções, dados..." />
        </div>

        <Button type="submit" size="lg" disabled={generate.isPending} className="gap-2">
          {generate.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Gerando...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Gerar Copies</>
          )}
        </Button>
      </form>

      {results?.copies && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Resultados</h2>
          {results.copies.map((copy: any, i: number) => (
            <CopyResultCard key={i} copy={copy} index={i} onApprove={handleApprove} />
          ))}
        </div>
      )}

      <ApprovedCopyModal
        open={approveModal.open}
        onClose={() => setApproveModal({ open: false, copy: null })}
        onSave={handleSaveApproved}
        copyPreview={{ title: approveModal.copy?.title, body: approveModal.copy?.body }}
      />
    </div>
  );
}
