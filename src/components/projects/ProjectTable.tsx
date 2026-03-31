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
import { Edit2, Save, X, Trash2, ArrowUpDown, Download, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

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
  userRole?: string;
}

export function ProjectTable({ initialData, readOnly = false, userRole = 'co_leader' }: ProjectTableProps) {
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
      const result = await res.json();
      
      if (res.ok) {
        setData(data.map((p) => (p.id === id ? result : p)));
        setEditingId(null);
      } else {
        alert(`Error saving project: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Save error', err);
      alert('Failed to save project. Please check your connection.');
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

  const handleDownloadCSV = () => {
    const exportData = data.map((p) => ({
      'Project Name': p.project_name,
      'Project ID': p.project_id,
      'Profile': p.profile,
      'Status': p.client_status,
      'Last Update': p.last_update,
      'Last Seen': p.last_seen_info,
      'Notes': p.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `projects_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert('The uploaded file is empty.');
          return;
        }

        const formattedData = jsonData.map((row: any) => ({
          project_name: row['Project Name'] || row['project_name'] || 'Untitled Project',
          project_id: String(row['Project ID'] || row['Id'] || row['project_id'] || Math.random().toString(36).substr(2, 9)),
          profile: row['Profile'] || row['profile'] || 'General',
          client_status: row['Status'] || row['client_status'] || 'Active',
          last_update: row['Last Update'] || row['last_update'] || 'Bulk Uploaded',
          last_seen_info: row['Last Seen'] || row['last_seen_info'] || 'Just now',
          notes: row['Notes'] || row['notes'] || '',
        }));

        const res = await fetch('/api/projects/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData),
        });

        if (res.ok) {
          alert('Projects uploaded and updated successfully!');
          window.location.reload();
        } else {
          const error = await res.json();
          alert(`Failed to upload: ${error.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('File parse error:', err);
        alert('Failed to parse file. Please ensure it is a valid CSV or Excel file.');
      }
    };
    reader.readAsBinaryString(file);
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
        const canEdit = userRole === 'leader';
        return isEditing && canEdit ? (
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
      header: ({ column }) => (
        <span className="hidden lg:inline-block">Project ID</span>
      ),
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        const canEdit = userRole === 'leader';
        return isEditing && canEdit ? (
          <div className="hidden lg:block">
            <Input
              value={editForm.project_id}
              onChange={(e) => setEditForm({ ...editForm, project_id: e.target.value })}
              className="h-8 w-full"
            />
          </div>
        ) : (
          <span className="text-xs font-mono text-muted-foreground hidden lg:inline-block truncate max-w-[100px]">{row.getValue('project_id')}</span>
        );
      },
    },
    {
      accessorKey: 'profile',
      header: ({ column }) => (
        <span className="hidden md:inline-block">Profile</span>
      ),
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        const canEdit = userRole === 'leader';
        return isEditing && canEdit ? (
          <div className="hidden md:block">
            <Input
              value={editForm.profile}
              onChange={(e) => setEditForm({ ...editForm, profile: e.target.value })}
              className="h-8 w-full"
            />
          </div>
        ) : (
          <span className="hidden md:inline-block">{row.getValue('profile')}</span>
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
      header: ({ column }) => (
        <span className="hidden sm:inline-block">Last Update</span>
      ),
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <div className="hidden sm:block">
            <Input
              value={editForm.last_update}
              onChange={(e) => setEditForm({ ...editForm, last_update: e.target.value })}
              className="h-8 w-full"
            />
          </div>
        ) : (
          <span className="text-sm hidden sm:inline-block">{row.getValue('last_update')}</span>
        );
      },
    },
    {
      accessorKey: 'last_seen_info',
      header: ({ column }) => (
        <span className="hidden md:inline-block">Last Seen</span>
      ),
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <div className="hidden md:block">
            <Input
              value={editForm.last_seen_info}
              onChange={(e) => setEditForm({ ...editForm, last_seen_info: e.target.value })}
              className="h-8 w-full"
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground hidden md:inline-block">{row.getValue('last_seen_info')}</span>
        );
      },
    },
    {
      accessorKey: 'notes',
      header: ({ column }) => (
        <span className="hidden lg:inline-block">Notes</span>
      ),
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <div className="hidden lg:block">
            <Input
              value={editForm.notes || ''}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="h-8 w-full"
            />
          </div>
        ) : (
          <span className="text-sm line-clamp-1 max-w-[150px] hidden lg:inline-block">{row.getValue('notes')}</span>
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
                {userRole === 'leader' && (
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(row.original.id)} className="h-8 w-8 hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Input
            placeholder="Filter projects..."
            value={(table.getColumn('project_name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('project_name')?.setFilterValue(event.target.value)
            }
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {userRole === 'leader' && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                id="csv-upload"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('csv-upload')?.click()}
                className="flex items-center text-blue-600 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Upload CSV</span>
              </Button>
            </div>
          )}
          {userRole === 'co_leader' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCSV}
              className="flex items-center text-green-600 border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Download CSV</span>
            </Button>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
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
    </div>
  );
}
