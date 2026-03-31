import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Slide {
  slide_number: number;
  text: string;
}

interface CopyResult {
  title?: string;
  subtitle?: string;
  body?: string;
  cta?: string;
  slides?: Slide[];
}

interface Props {
  copy: CopyResult;
  index: number;
  onApprove: (copy: CopyResult) => void;
}

export default function CopyResultCard({ copy, index, onApprove }: Props) {
  const [copied, setCopied] = useState(false);

  const isCarousel = Array.isArray(copy.slides) && copy.slides.length > 0;

  const fullText = isCarousel
    ? copy.slides!.map(s => `**Slide ${s.slide_number}**\n${s.text}`).join('\n\n')
    : [copy.title, copy.subtitle, copy.body, copy.cta].filter(Boolean).join('\n\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {isCarousel ? `Carrossel #${index + 1}` : `Copy #${index + 1}`}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1">{copied ? 'Copiado' : 'Copiar'}</span>
            </Button>
            <Button size="sm" onClick={() => onApprove(copy)} className="gap-1">
              <Star className="h-4 w-4" />
              Aprovar
            </Button>
          </div>
        </div>
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
      </CardContent>
    </Card>
  );
}
