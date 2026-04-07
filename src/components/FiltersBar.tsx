import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CHANNELS, OBJECTIVES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Filters {
  channel?: string;
  objective?: string;
  product_id?: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  products: Array<{ id: string; name: string }>;
}

export default function FiltersBar({ filters, onChange, products }: Props) {
  const clear = () => onChange({});

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={filters.channel ?? 'all'} onValueChange={v => onChange({ ...filters, channel: v === 'all' ? undefined : v })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Canal" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos canais</SelectItem>
          {CHANNELS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.objective ?? 'all'} onValueChange={v => onChange({ ...filters, objective: v === 'all' ? undefined : v })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Objetivo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos objetivos</SelectItem>
          {OBJECTIVES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {products.length > 0 && (
        <Select value={filters.product_id ?? 'all'} onValueChange={v => onChange({ ...filters, product_id: v === 'all' ? undefined : v })}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Produto" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos produtos</SelectItem>
            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {Object.values(filters).some(Boolean) && (
        <Button variant="ghost" size="sm" onClick={clear} className="gap-1">
          <X className="h-3 w-3" /> Limpar
        </Button>
      )}
    </div>
  );
}
