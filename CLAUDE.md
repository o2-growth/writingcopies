# Lovable Project — Convenções para Agentes

Este projeto foi criado no Lovable e pode retornar ao Lovable.
Siga estas convenções para manter compatibilidade total.

## Stack

- **Frontend:** React + Vite + TypeScript
- **Estilo:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (auth, database, RLS)
- **Sem suporte a:** Angular, Vue, Svelte, Next.js, apps mobile, código backend direto (Python, Node standalone, etc.)

## Design System — Regras Críticas

### Tokens Semânticos (OBRIGATÓRIO)

- NUNCA use classes diretas de cor como `text-white`, `bg-white`, `text-black`, `bg-black`
- SEMPRE defina cores, gradientes e fontes via tokens no `index.css` e `tailwind.config.ts`
- SEMPRE use HSL no `index.css`
- NUNCA misture cores RGB no `index.css` com funções HSL no `tailwind.config.ts`

```css
/* index.css — padrão correto */
:root {
  --primary: 220 90% 56%;           /* HSL sem hsl() wrapper */
  --primary-glow: 220 90% 70%;
  --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
  --shadow-elegant: 0 10px 30px -10px hsl(var(--primary) / 0.3);
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### shadcn/ui

- Customize componentes shadcn com **variantes**, nunca com overrides inline
- Crie variantes para todos os estados necessários
- Variantes `outline` do shadcn não são transparentes por padrão — crie variantes explícitas

```tsx
// Exemplo: button.tsx com variante customizada
const buttonVariants = cva("...", {
  variants: {
    variant: {
      premium: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground",
      hero: "bg-white/10 text-white border border-white/20 hover:bg-white/20",
    }
  }
})
```

### Responsividade

- Todo design deve ser responsivo
- Verifique contraste em dark mode e light mode
- Evite texto branco sobre fundo branco (e vice-versa)

## Estrutura de Arquivos

- Componentes pequenos e focados — evite arquivos grandes
- Nomes únicos para componentes e arquivos
- Novos componentes em arquivos próprios, não no `index.tsx`
- Imports absolutos quando possível

## Código

### O que fazer
- Código TypeScript válido e tipado
- Componentes reutilizáveis
- Tratamento de erro com toast (shadcn/ui `useToast`)
- Lazy loading para imagens
- Semantic HTML (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<nav>`)

### O que NÃO fazer
- NÃO use variáveis de ambiente `VITE_*` (não suportadas no Lovable)
- NÃO adicione features não solicitadas explicitamente
- NÃO crie estilos ad-hoc inline nos componentes
- NÃO reescreva arquivos inteiros quando search-replace resolve
- NÃO faça chamadas sequenciais quando podem ser paralelas

## SEO (automático em toda página)

- `<title>` — keyword principal, máx 60 caracteres
- `<meta description>` — máx 160 caracteres com keyword
- Um único `<h1>` por página
- Imagens com atributo `alt` descritivo
- JSON-LD para produtos, artigos e FAQs quando aplicável
- Tag canonical para evitar conteúdo duplicado

## Supabase

- RLS (Row Level Security) ativo por padrão
- Migrations versionadas em `supabase/migrations/`
- Nunca exponha chaves de serviço no frontend
- Use o cliente Supabase do pacote `@supabase/supabase-js`

## Workflow dos Agentes

### @dev (Dex)
1. Leia o contexto existente antes de qualquer mudança
2. Confirme o escopo antes de implementar
3. Faça mudanças mínimas e corretas
4. Atualize o design system (`index.css`, `tailwind.config.ts`) quando necessário
5. Conclua com resumo curto do que foi alterado

### @data-engineer (Dara)
1. Toda mudança de schema via migration (`supabase/migrations/`)
2. Defina RLS policies para toda nova tabela
3. Índices para colunas usadas em queries frequentes

### @ux-design-expert (Uma)
1. Design system sempre antes dos componentes
2. Use variantes shadcn — nunca overrides
3. Tokens semânticos para tudo

### @devops (Gage)
1. Push para o branch conectado ao Lovable (normalmente `main`)
2. Verifique se o build passa antes do push: `npm run build`
3. Confirme que não há arquivos sensíveis no commit

## Compatibilidade com Lovable

Ao devolver o projeto ao Lovable:
- Certifique que `npm run build` passa sem erros
- Sem variáveis de ambiente hardcoded
- Design system intacto em `index.css` e `tailwind.config.ts`
- Sem dependências incompatíveis adicionadas
