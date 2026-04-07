import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Star, ThumbsDown, Send, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  copy: Record<string, any>;
  index: number;
  onApprove: (copy: Record<string, any>) => void;
  onReject?: (index: number, feedback: string) => Promise<void>;
  isRegenerating?: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  title: 'Título',
  subtitle: 'Subtítulo',
  body: 'Corpo',
  cta: 'CTA',
  script: 'Roteiro',
  caption: 'Legenda',
  headline: 'Headline',
  primary_text: 'Texto Principal',
  description: 'Descrição',
  slides: 'Slides',
};

function formatFieldLabel(key: string): string {
  return FIELD_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function renderFieldValue(key: string, value: any): React.ReactNode {
  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="pl-3 border-l-2 border-border">
            {typeof item === 'object' && item !== null ? (
              Object.entries(item).map(([k, v]) => (
                <div key={k}>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{formatFieldLabel(k)}: </span>
                  <span className="text-foreground">{String(v)}</span>
                </div>
              ))
            ) : (
              <p className="text-foreground">{String(item)}</p>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <span className="text-xs font-semibold text-muted-foreground uppercase">{formatFieldLabel(k)}: </span>
            <span className="text-foreground">{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <p className="text-foreground whitespace-pre-wrap">{String(value)}</p>;
}

function copyToText(copy: Record<string, any>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(copy)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) continue;
    if (Array.isArray(value)) {
      parts.push(`**${formatFieldLabel(key)}:**`);
      value.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          parts.push(Object.entries(item).map(([k, v]) => `${formatFieldLabel(k)}: ${v}`).join(' | '));
        } else {
          parts.push(`${i + 1}. ${String(item)}`);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      parts.push(`**${formatFieldLabel(key)}:**`);
      parts.push(Object.entries(value).map(([k, v]) => `${formatFieldLabel(k)}: ${v}`).join('\n'));
    } else {
      parts.push(`**${formatFieldLabel(key)}:**\n${String(value)}`);
    }
  }
  return parts.join('\n\n');
}

export default function CopyResultCard({ copy, index, onApprove, onReject, isRegenerating }: Props) {
  const [copied, setCopied] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyToText(copy));
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRejectSubmit = async () => {
    if (!feedback.trim()) {
      toast.error('Escreva um comentário para reescrever a copy.');
      return;
    }
    if (onReject) {
      await onReject(index, feedback.trim());
      setShowRejectForm(false);
      setFeedback('');
    }
  };

  // Separate caption to render at the bottom with a divider
  const { caption, ...mainFields } = copy;
  const fieldsToRender = Object.entries(mainFields).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  );

  return (
    <Card className={`border-border ${isRegenerating ? 'opacity-60 pointer-events-none' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Copy #{index + 1}
            {isRegenerating && <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1">{copied ? 'Copiado' : 'Copiar'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRejectForm(!showRejectForm)}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <ThumbsDown className="h-4 w-4" />
              Reprovar
            </Button>
            <Button size="sm" onClick={() => onApprove(copy)} className="gap-1">
              <Star className="h-4 w-4" />
              Aprovar
            </Button>
          </div>
        </div>
        {showRejectForm && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Descreva o que deve ser alterado nessa copy..."
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setShowRejectForm(false); setFeedback(''); }}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleRejectSubmit} className="gap-1">
                <Send className="h-4 w-4" /> Reescrever
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {fieldsToRender.map(([key, value]) => (
          <div key={key}>
            <p className="text-xs font-semibold text-muted-foreground uppercase">{formatFieldLabel(key)}</p>
            {renderFieldValue(key, value)}
          </div>
        ))}
        {caption && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Legenda</p>
            <p className="text-foreground whitespace-pre-wrap">{String(caption)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
