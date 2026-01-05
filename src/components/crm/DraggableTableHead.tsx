import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, GripVertical } from 'lucide-react';
import { CrmLead } from '@/lib/crm/types';

interface DraggableTableHeadProps {
  id: string;
  label: string;
  field: keyof CrmLead;
  onSort: (field: keyof CrmLead) => void;
}

const DraggableTableHead: React.FC<DraggableTableHeadProps> = ({
  id,
  label,
  field,
  onSort,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div className="flex items-center gap-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSort(field)}
          className="h-8 p-0 font-medium"
        >
          {label}
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </TableHead>
  );
};

export default DraggableTableHead;
