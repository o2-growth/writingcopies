import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Star, ThumbsDown, Send, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CopyResult {
  title?: string;
  subtitle?: string;
  body?: string;
  cta?: string;
  script?: string;
  caption?: string;
}

interface Props {
  copy: CopyResult;
  index: number;
  onApprove: (copy: CopyResult) => void;
  onReject?: (index: number, feedback: string) => Promise<void>;
  isRegenerating?: boolean;
}

export default function CopyResultCard({ copy, index, onApprove, onReject, isRegenerating }: Props) {
  const [copied, setCopied] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [feedback, setFeedback] = useState('');

  const isCarousel = Array.isArray(copy.slides) && copy.slides.length > 0;
  const isVideo = !isCarousel && typeof copy.script === 'string' && copy.script.length > 0;

  const contentText = isCarousel
    ? copy.slides!.map(s => `**Slide ${s.slide_number}**\n${s.text}`).join('\n\n')
    : isVideo
    ? copy.script!
    : [copy.title, copy.subtitle, copy.body, copy.cta].filter(Boolean).join('\n\n');

  const fullText = copy.caption ? `${contentText}\n\n**Legenda:**\n${copy.caption}` : contentText;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
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

  return (
    <Card className={`border-border ${isRegenerating ? 'opacity-60 pointer-events-none' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {isCarousel ? `Carrossel #${index + 1}` : isVideo ? `Roteiro #${index + 1}` : `Copy #${index + 1}`}
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
        {isCarousel ? (
          copy.slides!.map(slide => (
            <div key={slide.slide_number} className="border-l-2 border-primary/30 pl-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Slide {slide.slide_number}
              </p>
              <p className="text-foreground whitespace-pre-wrap">{slide.text}</p>
            </div>
          ))
        ) : isVideo ? (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Roteiro</p>
            <p className="text-foreground whitespace-pre-wrap">{copy.script}</p>
          </div>
        ) : (
          <>
            {copy.title && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Título</p>
                <p className="text-foreground font-medium">{copy.title}</p>
              </div>
            )}
            {copy.subtitle && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Subtítulo</p>
                <p className="text-foreground">{copy.subtitle}</p>
              </div>
            )}
            {copy.body && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Corpo</p>
                <p className="text-foreground whitespace-pre-wrap">{copy.body}</p>
              </div>
            )}
            {copy.cta && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">CTA</p>
                <p className="text-primary font-semibold">{copy.cta}</p>
              </div>
            )}
          </>
        )}
        {copy.caption && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Legenda</p>
            <p className="text-foreground whitespace-pre-wrap">{copy.caption}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
