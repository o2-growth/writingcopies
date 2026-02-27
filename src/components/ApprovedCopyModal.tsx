import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { tags: string[]; notes: string }) => void;
  copyPreview: { title?: string; body?: string };
}

export default function ApprovedCopyModal({ open, onClose, onSave, copyPreview }: Props) {
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      notes,
    });
    setTags('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Salvar na Biblioteca</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {copyPreview.title && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium">{copyPreview.title}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>Tags (separar por vírgula)</Label>
            <Input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="ex: lançamento, black friday"
            />
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observações sobre esta copy..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
