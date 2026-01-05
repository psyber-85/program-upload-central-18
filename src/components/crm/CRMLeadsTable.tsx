import React, { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Upload, RotateCcw } from 'lucide-react';
import { useCrm } from '@/lib/crm/CRMContext';
import { CrmLead } from '@/lib/crm/types';
import { MALAYSIAN_STATES, LEAD_SCORES, LEAD_STATUSES } from '@/lib/crm/types';
import CRMAddLeadModal from './CRMAddLeadModal';
import CRMImportLeadsModal from './CRMImportLeadsModal';
import CRMContactButton from './CRMContactButton';
import CRMActivityHistory from './CRMActivityHistory';
import CRMMobileLeadCard from './CRMMobileLeadCard';
import DraggableTableHead from './DraggableTableHead';
import { updateCrmLeadField } from '@/lib/crm/placeholderFunctions';

// Column configuration
interface ColumnConfig {
  id: string;
  label: string;
  field: keyof CrmLead;
  type: 'text' | 'number' | 'select';
  options?: readonly string[];
}

const COLUMNS: ColumnConfig[] = [
  { id: 'name', label: 'Name', field: 'crm_name', type: 'text' },
  { id: 'email', label: 'Email', field: 'crm_email', type: 'text' },
  { id: 'number', label: 'Phone', field: 'crm_number', type: 'text' },
  { id: 'jobRole', label: 'Role', field: 'crm_jobRole', type: 'text' },
  { id: 'org', label: 'Organization', field: 'crm_org', type: 'text' },
  { id: 'state', label: 'State', field: 'crm_state', type: 'select', options: MALAYSIAN_STATES },
  { id: 'leadScore', label: 'Score', field: 'crm_leadScore', type: 'select', options: LEAD_SCORES },
  { id: 'status', label: 'Status', field: 'crm_status', type: 'select', options: LEAD_STATUSES },
  { id: 'potentialDealSize', label: 'Potential', field: 'crm_potentialDealSize', type: 'number' },
  { id: 'confirmedDealSize', label: 'Confirmed', field: 'crm_confirmedDealSize', type: 'number' },
];

const DEFAULT_COLUMN_ORDER = COLUMNS.map(col => col.id);
const STORAGE_KEY = 'crm-leads-column-order';

const CRMLeadsTable = () => {
  const { state, dispatch } = useCrm();
  const { leads, searchTerm, sortField, sortDirection, activeCampaignId } = state;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCell, setEditingCell] = useState<{ leadId: string; field: keyof CrmLead } | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_COLUMN_ORDER);

  // Load column order from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate saved order contains all columns
        if (Array.isArray(parsed) && parsed.length === DEFAULT_COLUMN_ORDER.length) {
          setColumnOrder(parsed);
        }
      } catch {
        // Use default order if parsing fails
      }
    }
  }, []);

  // Save column order to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnOrder));
  }, [columnOrder]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get ordered columns
  const orderedColumns = useMemo(() => {
    return columnOrder.map(id => COLUMNS.find(col => col.id === id)!).filter(Boolean);
  }, [columnOrder]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Reset column order
  const resetColumnOrder = () => {
    setColumnOrder(DEFAULT_COLUMN_ORDER);
  };

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const searchLower = searchTerm.toLowerCase();
      return (
        lead.crm_name.toLowerCase().includes(searchLower) ||
        lead.crm_email.toLowerCase().includes(searchLower) ||
        lead.crm_org.toLowerCase().includes(searchLower) ||
        lead.crm_jobRole.toLowerCase().includes(searchLower) ||
        lead.crm_state.toLowerCase().includes(searchLower)
      );
    });

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [leads, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof CrmLead) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    dispatch({ type: 'SET_SORT', payload: { field, direction: newDirection } });
  };

  const handleCellEdit = async (leadId: string, field: keyof CrmLead, value: any) => {
    try {
      await updateCrmLeadField(leadId, field, value);
      
      const updatedLead = leads.find(l => l.crm_id === leadId);
      if (updatedLead) {
        const newLead = { ...updatedLead, [field]: value };
        dispatch({ type: 'UPDATE_LEAD', payload: newLead });
      }
      
      setEditingCell(null);
    } catch (error) {
      console.error('Error updating lead field:', error);
    }
  };

  const EditableCell: React.FC<{
    lead: CrmLead;
    field: keyof CrmLead;
    type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
    options?: readonly string[];
  }> = ({ lead, field, type = 'text', options }) => {
    const [value, setValue] = useState(lead[field]?.toString() || '');
    const isEditing = editingCell?.leadId === lead.crm_id && editingCell?.field === field;

    const handleSave = () => {
      const processedValue = type === 'number' ? parseFloat(value) || 0 : value;
      handleCellEdit(lead.crm_id, field, processedValue);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') setEditingCell(null);
    };

    if (isEditing) {
      if (type === 'select' && options) {
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="w-full p-1 border rounded text-sm"
            autoFocus
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }

      if (type === 'textarea') {
        return (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === 'Escape') setEditingCell(null);
            }}
            className="w-full p-1 border rounded text-sm resize-none"
            rows={2}
            autoFocus
          />
        );
      }

      return (
        <Input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          className="h-8 text-sm"
          autoFocus
        />
      );
    }

    return (
      <div
        onClick={() => setEditingCell({ leadId: lead.crm_id, field })}
        className="cursor-pointer hover:bg-muted p-1 rounded min-h-[24px] text-sm"
        title="Click to edit"
      >
        {type === 'number' ? 
          new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(Number(lead[field]) || 0) :
          lead[field]?.toString() || '—'
        }
      </div>
    );
  };

  if (!activeCampaignId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Select a campaign to view leads</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Campaign Leads</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetColumnOrder} title="Reset column order">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setShowAddModal(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="rounded-md border overflow-x-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToHorizontalAxis]}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableContext
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        {orderedColumns.map((col) => (
                          <DraggableTableHead
                            key={col.id}
                            id={col.id}
                            label={col.label}
                            field={col.field}
                            onSort={handleSort}
                          />
                        ))}
                      </SortableContext>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedLeads.map((lead) => (
                      <React.Fragment key={lead.crm_id}>
                        <TableRow className="hover:bg-muted/50">
                          {orderedColumns.map((col) => (
                            <TableCell key={col.id}>
                              <EditableCell
                                lead={lead}
                                field={col.field}
                                type={col.type}
                                options={col.options}
                              />
                            </TableCell>
                          ))}
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <CRMContactButton leadId={lead.crm_id} />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedRow(expandedRow === lead.crm_id ? null : lead.crm_id)}
                              >
                                History
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedRow === lead.crm_id && (
                          <TableRow>
                            <TableCell colSpan={orderedColumns.length + 1}>
                              <CRMActivityHistory leadId={lead.crm_id} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </DndContext>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredAndSortedLeads.map((lead) => (
              <CRMMobileLeadCard key={lead.crm_id} lead={lead} />
            ))}
          </div>

          {filteredAndSortedLeads.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No leads found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CRMAddLeadModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        campaignId={activeCampaignId}
      />

      <CRMImportLeadsModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
      />
    </>
  );
};

export default CRMLeadsTable;
