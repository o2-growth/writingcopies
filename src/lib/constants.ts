export const COPY_TYPES = [
  { value: 'titulo', label: 'Título' },
  { value: 'subtitulo', label: 'Subtítulo' },
  { value: 'corpo', label: 'Corpo' },
  { value: 'cta', label: 'CTA' },
  { value: 'completa', label: 'Completa' },
] as const;

export const SIZES = [
  { value: 'S', label: 'S – Curto' },
  { value: 'M', label: 'M – Médio' },
  { value: 'L', label: 'L – Longo' },
  { value: 'XL', label: 'XL – Extra Longo' },
] as const;

export const OBJECTIVES = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'engajamento', label: 'Engajamento' },
  { value: 'leads', label: 'Leads' },
  { value: 'conversao', label: 'Conversão' },
  { value: 'vendas', label: 'Vendas' },
] as const;

export const CHANNELS = [
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
] as const;

// FORMATS removed — now managed dynamically via admin (formats table)

export type CopyType = typeof COPY_TYPES[number]['value'];
export type Size = typeof SIZES[number]['value'];
export type Objective = typeof OBJECTIVES[number]['value'];
export type Channel = typeof CHANNELS[number]['value'];
export type Format = typeof FORMATS[number]['value'];

export const PROFILES = [
  { value: 'company', label: 'O2 Inc.', description: 'Perfil institucional da empresa' },
  { value: 'ceo', label: 'CEO', description: 'Perfil pessoal do CEO' },
] as const;

export type Profile = typeof PROFILES[number]['value'];
