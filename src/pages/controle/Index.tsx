import { useChampions, type ChampionRecord } from '@/hooks/useChampions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy, Crown, Clock, Package, Radio, FileVideo, Image, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

function ChampionCard({ champion }: { champion: ChampionRecord }) {
  const copy = champion.approved_copies;
  return (
    <Card className="shadow-apple-sm ring-1 ring-amber-400/30 dark:ring-amber-500/20">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <Crown className="h-4 w-4 text-amber-500 shrink-0" />
              {copy?.title && (
                <p className="font-semibold text-sm text-foreground truncate">{copy.title}</p>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {copy?.body ?? '—'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">{champion.channel}</Badge>
          <Badge variant="outline" className="text-xs border-primary/40 text-primary">
            {champion.format === 'video' ? 'Vídeo' : 'Estático'}
          </Badge>
          {copy?.copy_type && <Badge variant="outline" className="text-xs">{copy.copy_type}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Trophy className="h-3 w-3 text-amber-500" />
          Campeã há{' '}
          {formatDistanceToNow(new Date(champion.champion_at), { locale: ptBR, addSuffix: false })}
        </p>
      </CardContent>
    </Card>
  );
}

function GroupSection({
  title,
  icon: Icon,
  champions,
}: {
  title: string;
  icon: React.ElementType;
  champions: ChampionRecord[];
}) {
  if (champions.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {champions.map(c => <ChampionCard key={c.id} champion={c} />)}
      </div>
    </div>
  );
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export default function ControlePage() {
  const { activeChampions, championHistory, isLoading, isHistoryLoading } = useChampions();

  const byProduct = groupBy(activeChampions, c => c.products?.name ?? 'Sem produto');
  const byChannel = groupBy(activeChampions, c => c.channel);
  const byFormat = groupBy(activeChampions, c => c.format);

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Copy Controle
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Copies campeãs por categoria e histórico de substituições.
        </p>
      </div>

      {/* First fold — Active champions */}
      {activeChampions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <Trophy className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="font-medium text-muted-foreground">Nenhuma copy campeã ainda</p>
            <p className="text-sm text-muted-foreground/70">
              Vá até a Biblioteca e marque copies como campeãs usando o botão{' '}
              <Trophy className="h-3.5 w-3.5 inline text-amber-500" />.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Por produto */}
          <Card className="shadow-apple-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Por Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(byProduct).map(([product, champions]) => (
                <GroupSection
                  key={product}
                  title={product}
                  icon={Package}
                  champions={champions}
                />
              ))}
            </CardContent>
          </Card>

          {/* Por canal */}
          <Card className="shadow-apple-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary" />
                Por Canal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(byChannel).map(([channel, champions]) => (
                <GroupSection
                  key={channel}
                  title={channel}
                  icon={Radio}
                  champions={champions}
                />
              ))}
            </CardContent>
          </Card>

          {/* Por formato */}
          <Card className="shadow-apple-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileVideo className="h-5 w-5 text-primary" />
                Por Formato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(byFormat).map(([format, champions]) => (
                <GroupSection
                  key={format}
                  title={format === 'video' ? 'Vídeo' : 'Estático'}
                  icon={format === 'video' ? FileVideo : Image}
                  champions={champions}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Separator />

      {/* Second section — History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Histórico de Campeãs
        </h2>

        {isHistoryLoading ? (
          <p className="text-sm text-muted-foreground">Carregando histórico...</p>
        ) : championHistory.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              Nenhuma copy foi substituída ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {championHistory.map(record => (
              <Card key={record.id} className="shadow-apple-sm opacity-75 hover:opacity-100 transition-opacity">
                <CardContent className="py-3 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                      {record.approved_copies?.body ?? '—'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge variant="secondary" className="text-xs">{record.channel}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {record.format === 'video' ? 'Vídeo' : 'Estático'}
                      </Badge>
                      {record.products?.name && (
                        <Badge variant="outline" className="text-xs">{record.products.name}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Crown className="h-3 w-3 text-amber-400" />
                      {new Date(record.champion_at).toLocaleDateString('pt-BR')}
                    </p>
                    {record.replaced_at && (
                      <p className="text-xs text-muted-foreground/60 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {new Date(record.replaced_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
