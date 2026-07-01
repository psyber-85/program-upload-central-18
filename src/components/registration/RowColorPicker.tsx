import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RowColor = 'red' | 'amber' | 'green' | 'blue' | 'purple';

const COLORS: { key: RowColor; label: string; swatch: string }[] = [
  { key: 'red', label: 'Red', swatch: 'bg-red-500' },
  { key: 'amber', label: 'Amber', swatch: 'bg-amber-500' },
  { key: 'green', label: 'Green', swatch: 'bg-green-500' },
  { key: 'blue', label: 'Blue', swatch: 'bg-blue-500' },
  { key: 'purple', label: 'Purple', swatch: 'bg-purple-500' },
];

export const ROW_COLOR_TINT: Record<RowColor, string> = {
  red: 'bg-red-50 hover:bg-red-100/70 border-l-4 border-l-red-400',
  amber: 'bg-amber-50 hover:bg-amber-100/70 border-l-4 border-l-amber-400',
  green: 'bg-green-50 hover:bg-green-100/70 border-l-4 border-l-green-400',
  blue: 'bg-blue-50 hover:bg-blue-100/70 border-l-4 border-l-blue-400',
  purple: 'bg-purple-50 hover:bg-purple-100/70 border-l-4 border-l-purple-400',
};

export function getRowTintClass(color?: string | null): string {
  if (!color) return '';
  return ROW_COLOR_TINT[color as RowColor] ?? '';
}

interface RowColorPickerProps {
  prospectId: string;
  currentColor?: string | null;
  onChange?: (color: RowColor | null) => void;
}

const RowColorPicker: React.FC<RowColorPickerProps> = ({ prospectId, currentColor, onChange }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const active = COLORS.find((c) => c.key === currentColor);

  const update = async (color: RowColor | null) => {
    setSaving(true);
    onChange?.(color);
    try {
      const { error } = await supabase
        .from('prospects')
        .update({ row_color: color })
        .eq('id', prospectId);
      if (error) throw error;
    } catch (e) {
      console.error('Failed to update row color', e);
      toast({ title: 'Error', description: 'Could not update row color', variant: 'destructive' });
    } finally {
      setSaving(false);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Set row color"
          title={active ? `Color: ${active.label}` : 'Set row color'}
          disabled={saving}
          className={cn(
            'w-4 h-4 rounded-full border border-gray-300 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring',
            active ? active.swatch : 'bg-white'
          )}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => update(c.key)}
              title={c.label}
              className={cn(
                'w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center transition hover:scale-110',
                c.swatch
              )}
            >
              {currentColor === c.key && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
          ))}
          <button
            type="button"
            onClick={() => update(null)}
            title="Clear color"
            className="w-6 h-6 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RowColorPicker;
