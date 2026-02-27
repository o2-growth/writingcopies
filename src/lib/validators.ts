import { z } from 'zod';

export const generateCopySchema = z.object({
  product_id: z.string().uuid().optional(),
  copywriter_ids: z.array(z.string().uuid()).min(0).max(2),
  channel: z.enum(['twitter', 'instagram', 'linkedin', 'email', 'whatsapp']),
  objective: z.enum(['awareness', 'engajamento', 'leads', 'conversao', 'vendas']),
  copy_type: z.enum(['titulo', 'subtitulo', 'corpo', 'cta', 'completa']),
  size: z.enum(['S', 'M', 'L', 'XL']),
  quantity: z.number().int().min(1).max(3),
  extra_context: z.string().max(2000).optional(),
});

export type GenerateCopyInput = z.infer<typeof generateCopySchema>;

export const companySettingsSchema = z.object({
  brand_name: z.string().min(1, 'Nome da marca obrigatório').max(200),
  brand_voice: z.string().min(1, 'Voz da marca obrigatória').max(5000),
  audience: z.string().max(2000).optional(),
  usp: z.string().max(2000).optional(),
  claims_allowed: z.string().max(2000).optional(),
  disclaimers: z.string().max(2000).optional(),
  language: z.string().max(10).optional(),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;

export const productSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(200),
  description: z.string().max(5000).optional(),
  benefits: z.string().max(5000).optional(),
  features: z.string().max(5000).optional(),
  objections: z.string().max(5000).optional(),
  pricing_notes: z.string().max(2000).optional(),
  links: z.string().max(2000).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const approvedCopySchema = z.object({
  title: z.string().max(500).optional(),
  body: z.string().min(1, 'Corpo obrigatório'),
  channel: z.string(),
  objective: z.string(),
  copy_type: z.string(),
  size: z.string(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
  product_id: z.string().uuid().optional().nullable(),
  generation_id: z.string().uuid().optional().nullable(),
  copywriter_a_id: z.string().uuid().optional().nullable(),
  copywriter_b_id: z.string().uuid().optional().nullable(),
});
