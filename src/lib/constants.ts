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

export type Objective = typeof OBJECTIVES[number]['value'];
export type Channel = typeof CHANNELS[number]['value'];
export type Format = string;

export const PROFILES = [
  { value: 'company', label: 'O2 Inc.', description: 'Perfil institucional da empresa' },
  { value: 'ceo', label: 'CEO', description: 'Perfil pessoal do CEO' },
] as const;

export type Profile = typeof PROFILES[number]['value'];
