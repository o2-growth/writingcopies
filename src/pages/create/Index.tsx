import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateCopySchema, type GenerateCopyInput } from '@/lib/validators';
import { COPY_TYPES, SIZES, OBJECTIVES, CHANNELS } from '@/lib/constants';
import { useProducts } from '@/hooks/useProducts';
import { useChampionExamples } from '@/hooks/useChampionExamples';
import { useCopywriters } from '@/hooks/useCopywriters';
import { useCompany } from '@/hooks/useCompany';
import { useEditorialLines } from '@/hooks/useEditorialLines';
import { useGenerateCopy } from '@/hooks/useGenerateCopy';
import { useFormats } from '@/hooks/useFormats';
import { useApprovedCopies } from '@/hooks/useApprovedCopies';
import CopyResultCard from '@/components/CopyResultCard';
import ApprovedCopyModal from '@/components/ApprovedCopyModal';
import ProfileToggle from '@/components/ProfileToggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function CreatePage() {
  const [profile, setProfile] = useState<'company' | 'ceo'>('company');
  const { products } = useProducts();
  const { activeCopywriters } = useCopywriters(profile);
  const { company } = useCompany(profile);
  const { editorialLines } = useEditorialLines(profile);
  const generate = useGenerateCopy();
  const { approve } = useApprovedCopies();
  const { formats } = useFormats();

  const [results, setResults] = useState<any>(null);
  const [lastInput, setLastInput] = useState<GenerateCopyInput | null>(null);
  const [approveModal, setApproveModal] = useState<{ open: boolean; copy: any }>({ open: false, copy: null });
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<GenerateCopyInput>({
    resolver: zodResolver(generateCopySchema),
    defaultValues: {
      profile: 'company',
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
  const selectedChannel = watch('channel');
  const selectedFormat = watch('format');
  const selectedFormatObj = formats.find(f => f.value === selectedFormat);
  const isScriptFormat = selectedFormatObj?.has_script_output ?? false;
  const selectedProductId = watch('product_id');
  const selectedObjective = watch('objective');

  const { examples: productChampionExamples } = useChampionExamples({
    product_id: selectedProductId && selectedProductId !== 'none' ? selectedProductId : undefined,
  });

  const showBestAdsCheckbox = selectedProductId && selectedProductId !== 'none'
    && ['conversao', 'leads', 'vendas'].includes(selectedObjective)
    && productChampionExamples.length > 0;

  const availableFormats = formats.filter(f => {
    if (!f.channels || f.channels.length === 0) return true;
    return f.channels.includes(selectedChannel);
  });

  // Reset format if selected format is no longer available for current channel
  if (selectedFormat && !availableFormats.some(f => f.value === selectedFormat)) {
    setValue('format', undefined);
  }

  const handleProfileChange = (newProfile: 'company' | 'ceo') => {
    setProfile(newProfile);
    setValue('profile', newProfile);
    setValue('editorial_line_id', undefined);
    setValue('copywriter_ids', []);
  };

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
      const submitData = { ...data, format_id: selectedFormatObj?.id };
      const result = await generate.mutateAsync(submitData);
      setResults(result);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar');
    }
  };

  const handleApprove = (copy: any) => {
    setApproveModal({ open: true, copy });
  };

  const handleReject = async (index: number, feedback: string) => {
    if (!lastInput) return;
    setRegeneratingIndex(index);
    try {
      const originalCopy = results.copies[index];
      const originalText = [originalCopy.title, originalCopy.subtitle, originalCopy.body, originalCopy.cta, originalCopy.script].filter(Boolean).join('\n');

      const rewriteContext = `REESCRITA SOLICITADA. A copy anterior foi reprovada. Segue a copy original:\n---\n${originalText}\n---\nMotivo da reprovação / instruções de reescrita:\n${feedback}\n\nGere uma nova versão corrigida seguindo essas instruções.`;

      const result = await generate.mutateAsync({
        ...lastInput,
        quantity: 1,
        extra_context: rewriteContext,
      });

      if (result?.copies?.[0]) {
        setResults((prev: any) => {
          const updated = { ...prev, copies: [...prev.copies] };
          updated.copies[index] = result.copies[0];
          return updated;
        });
        toast.success('Copy reescrita com sucesso!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao reescrever');
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleSaveApproved = async ({ tags, notes }: { tags: string[]; notes: string }) => {
    if (!lastInput || !approveModal.copy) return;
    try {
      const isVideo = typeof approveModal.copy.script === 'string' && approveModal.copy.script.length > 0;
      const contentBody = isVideo
        ? approveModal.copy.script
        : [approveModal.copy.title, approveModal.copy.subtitle, approveModal.copy.body, approveModal.copy.cta]
          .filter(Boolean).join('\n\n');
      const fullBody = approveModal.copy.caption
        ? `${contentBody}\n\n**Legenda:**\n${approveModal.copy.caption}`
        : contentBody;
      await approve.mutateAsync({
        title: isVideo ? 'Roteiro de Vídeo' : (approveModal.copy.title || null),
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
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfileToggle value={profile} onChange={handleProfileChange} />
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Configure o perfil {profile === 'company' ? 'da empresa' : 'do CEO'} primeiro</h2>
            <p className="text-muted-foreground">Antes de gerar copies, configure a voz da marca e dados.</p>
            <Link to="/admin/company">
              <Button>Ir para Configurações</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#FF69B4' }}>
      <h1 className="text-6xl md:text-8xl font-black text-white text-center drop-shadow-lg px-4">
        ta desmotivada
      </h1>
    </div>
  );
}
