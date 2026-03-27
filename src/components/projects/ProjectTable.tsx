'use client';

import { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Edit2, Save, X, Trash2, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Project = {
  id: string;
  project_name: string;
  project_id: string;
  profile: string;
  last_update: string;
  deadline: string;
  client_status: string;
  last_seen_info: string;
  notes: string | null;
};

interface ProjectTableProps {
  initialData: Project[];
  readOnly?: boolean;
}

export function ProjectTable({ initialData, readOnly = false }: ProjectTableProps) {
  const [data, setData] = useState<Project[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setEditForm(project);
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(data.map((p) => (p.id === id ? updated : p)));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Save error', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(data.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const getStatusColor = (status: string, deadline: string) => {
    const isOverdue = new Date(deadline) < new Date();
    if (isOverdue) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactive':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'project_name',
      header: 'Project Name',
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editForm.project_name}
            onChange={(e) => setEditForm({ ...editForm, project_name: e.target.value })}
            className="h-8 w-full"
          />
        ) : (
          <span className="font-medium">{row.getValue('project_name')}</span>
        );
      },
    },
    {
      accessorKey: 'project_id',
      header: 'Project ID',
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editForm.project_id}
            onChange={(e) => setEditForm({ ...editForm, project_id: e.target.value })}
            className="h-8 w-full"
          />
        ) : (
          <span className="text-xs font-mono text-muted-foreground">{row.getValue('project_id')}</span>
        );
      },
    },
    {
      accessorKey: 'profile',
      header: 'Profile',
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editForm.profile}
            onChange={(e) => setEditForm({ ...editForm, profile: e.target.value })}
            className="h-8 w-full"
          />
        ) : (
          <span>{row.getValue('profile')}</span>
        );
      },
    },
    {
      accessorKey: 'client_status',
      header: 'Status',
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        const status = row.getValue('client_status') as string;
        const deadline = row.original.deadline;
        
        return isEditing ? (
          <Select
            value={editForm.client_status}
            onValueChange={(v) => setEditForm({ ...editForm, client_status: v ?? '' })}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Active', 'Inactive', 'Follow-Up', 'Cancelled', 'Completed'].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge className={cn('font-normal', getStatusColor(status, deadline))}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'deadline',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Deadline
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            type="date"
            value={editForm.deadline?.split('T')[0]}
            onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
            className="h-8 w-full"
          />
        ) : (
          <span>{format(new Date(row.getValue('deadline')), 'MMM d, yyyy')}</span>
        );
      },
    },
    {
      accessorKey: 'last_update',
      header: 'Last Update',
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editForm.last_update}
            onChange={(e) => setEditForm({ ...editForm, last_update: e.target.value })}
            className="h-8 w-full"
          />
        ) : (
          <span className="text-sm">{row.getValue('last_update')}</span>
        );
      },
    },
    {
      accessorKey: 'last_seen_info',
      header: 'Last Seen',
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editForm.last_seen_info}
            onChange={(e) => setEditForm({ ...editForm, last_seen_info: e.target.value })}
            className="h-8 w-full"
          />
        ) : (
          <span className="text-xs text-muted-foreground">{row.getValue('last_seen_info')}</span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        if (readOnly) return null;
        
        const isEditing = editingId === row.original.id;
        return (
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button size="icon" variant="ghost" onClick={() => handleSave(row.original.id)}>
                  <Save className="h-4 w-4 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </>
            ) : (
              <>
                <Button size="icon" variant="ghost" onClick={() => handleEdit(row.original)} className="h-8 w-8 hover:bg-primary/10">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(row.original.id)} className="h-8 w-8 hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by project name..."
          value={(table.getColumn('project_name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('project_name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-white dark:bg-slate-900"
        />
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="rounded-md border bg-white dark:bg-slate-900">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
