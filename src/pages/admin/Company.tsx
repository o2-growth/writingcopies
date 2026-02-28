import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCompany } from '@/hooks/useCompany';
import { companySettingsSchema, type CompanySettingsInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trophy, Link as LinkIcon, FileText, Video, Image } from 'lucide-react';

type ChampionMode = 'text' | 'url';

function ChampionField({
  label,
  icon: Icon,
  textField,
  urlField,
  register,
  errors,
}: {
  label: string;
  icon: React.ElementType;
  textField: keyof CompanySettingsInput;
  urlField: keyof CompanySettingsInput;
  register: any;
  errors: any;
}) {
  const [mode, setMode] = useState<ChampionMode>('text');

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/30">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="font-medium text-sm">{label}</p>
      </div>

      <Tabs value={mode} onValueChange={v => setMode(v as ChampionMode)}>
        <TabsList className="h-8">
          <TabsTrigger value="text" className="text-xs gap-1.5">
            <FileText className="h-3 w-3" /> Colar texto
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs gap-1.5">
            <LinkIcon className="h-3 w-3" /> Informar URL
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'text' ? (
        <div className="space-y-1.5">
          <Textarea
            {...register(textField)}
            rows={5}
            placeholder="Cole aqui o texto completo da copy campeã..."
            className="text-sm resize-none"
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Input
            {...register(urlField)}
            placeholder="https://..."
            type="url"
          />
          {errors[urlField] && (
            <p className="text-xs text-destructive">{errors[urlField]?.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Company() {
  const { company, isLoading, upsert } = useCompany();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<CompanySettingsInput>({
    resolver: zodResolver(companySettingsSchema),
  });

  useEffect(() => {
    if (company) {
      reset({
        brand_name: company.brand_name,
        brand_voice: company.brand_voice,
        audience: company.audience ?? '',
        usp: company.usp ?? '',
        claims_allowed: company.claims_allowed ?? '',
        disclaimers: company.disclaimers ?? '',
        language: company.language ?? 'pt-BR',
        about: company.about ?? '',
        past_clients: company.past_clients ?? '',
        champion_video_copy: company.champion_video_copy ?? '',
        champion_video_url: company.champion_video_url ?? '',
        champion_static_copy: company.champion_static_copy ?? '',
        champion_static_url: company.champion_static_url ?? '',
      });
    }
  }, [company, reset]);

  const onSubmit = async (data: CompanySettingsInput) => {
    try {
      await upsert.mutateAsync(data);
      toast.success('Empresa salva!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Configurações da Empresa</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados da marca */}
        <Card className="shadow-apple-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Identidade da Marca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Marca *</Label>
              <Input {...register('brand_name')} placeholder="Sua marca" />
              {errors.brand_name && <p className="text-sm text-destructive">{errors.brand_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Voz da Marca *</Label>
              <Textarea {...register('brand_voice')} rows={4} placeholder="Descreva o tom de voz..." />
              {errors.brand_voice && <p className="text-sm text-destructive">{errors.brand_voice.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Público-alvo</Label>
              <Textarea {...register('audience')} rows={2} placeholder="Descreva seu público..." />
            </div>
            <div className="space-y-2">
              <Label>USP</Label>
              <Input {...register('usp')} placeholder="Proposta única de valor" />
            </div>
            <div className="space-y-2">
              <Label>Claims Permitidos</Label>
              <Textarea {...register('claims_allowed')} rows={2} placeholder="Claims que podem ser usados..." />
            </div>
            <div className="space-y-2">
              <Label>Disclaimers</Label>
              <Textarea {...register('disclaimers')} rows={2} placeholder="Disclaimers obrigatórios..." />
            </div>
            <div className="space-y-2">
              <Label>Sobre a Empresa</Label>
              <Textarea {...register('about')} rows={4} placeholder="Conte sobre a história e missão da empresa..." />
            </div>
            <div className="space-y-2">
              <Label>Clientes que já atendeu</Label>
              <Textarea {...register('past_clients')} rows={3} placeholder="Liste clientes relevantes..." />
            </div>
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Input {...register('language')} placeholder="pt-BR" />
            </div>
          </CardContent>
        </Card>

        {/* Copies Campeãs */}
        <Card className="shadow-apple-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Copies Campeãs de Venda</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Registre as copies que mais convertem. Elas serão usadas como referência pelo modelo de IA.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChampionField
              label="Anúncio em Vídeo"
              icon={Video}
              textField="champion_video_copy"
              urlField="champion_video_url"
              register={register}
              errors={errors}
            />
            <ChampionField
              label="Anúncio Estático"
              icon={Image}
              textField="champion_static_copy"
              urlField="champion_static_url"
              register={register}
              errors={errors}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={upsert.isPending} className="w-full sm:w-auto">
          {upsert.isPending ? 'Salvando...' : 'Salvar configurações'}
        </Button>
      </form>
    </div>
  );
}
