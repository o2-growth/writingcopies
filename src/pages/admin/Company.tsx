import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCompany } from '@/hooks/useCompany';
import { companySettingsSchema, type CompanySettingsInput } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileToggle from '@/components/ProfileToggle';
import { toast } from 'sonner';

export default function Company() {
  const [profile, setProfile] = useState<'company' | 'ceo'>('company');
  const { company, isLoading, upsert } = useCompany(profile);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanySettingsInput>({
    resolver: zodResolver(companySettingsSchema),
  });

  useEffect(() => {
    reset({
      profile,
      brand_name: company?.brand_name ?? '',
      brand_voice: company?.brand_voice ?? '',
      audience: company?.audience ?? '',
      usp: company?.usp ?? '',
      claims_allowed: company?.claims_allowed ?? '',
      disclaimers: company?.disclaimers ?? '',
      language: company?.language ?? 'pt-BR',
      about: company?.about ?? '',
      past_clients: company?.past_clients ?? '',
    });
  }, [company, reset, profile]);

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

      <ProfileToggle value={profile} onChange={setProfile} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-apple-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {profile === 'company' ? 'Identidade da Marca' : 'Perfil Pessoal do CEO'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome {profile === 'company' ? 'da Marca' : 'do CEO'} *</Label>
              <Input {...register('brand_name')} placeholder={profile === 'company' ? 'Sua marca' : 'Nome do CEO'} />
              {errors.brand_name && <p className="text-sm text-destructive">{errors.brand_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Voz {profile === 'company' ? 'da Marca' : 'Pessoal'} *</Label>
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
              <Label>Sobre {profile === 'company' ? 'a Empresa' : 'o CEO'}</Label>
              <Textarea {...register('about')} rows={4} placeholder={profile === 'company' ? 'Conte sobre a história e missão da empresa...' : 'Conte sobre a trajetória do CEO...'} />
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

        <Button type="submit" disabled={upsert.isPending} className="w-full sm:w-auto">
          {upsert.isPending ? 'Salvando...' : 'Salvar configurações'}
        </Button>
      </form>
    </div>
  );
}
