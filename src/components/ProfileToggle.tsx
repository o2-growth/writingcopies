import { PROFILES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Building2, User } from 'lucide-react';

interface ProfileToggleProps {
  value: 'company' | 'ceo';
  onChange: (profile: 'company' | 'ceo') => void;
}

const icons = {
  company: Building2,
  ceo: User,
};

export default function ProfileToggle({ value, onChange }: ProfileToggleProps) {
  return (
    <div className="flex gap-3">
      {PROFILES.map((p) => {
        const Icon = icons[p.value as keyof typeof icons];
        const isSelected = value === p.value;
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value as 'company' | 'ceo')}
            className={cn(
              'flex-1 flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all text-left',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/40'
            )}
          >
            <div className={cn(
              'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className={cn('text-sm font-semibold', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                {p.label}
              </p>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
