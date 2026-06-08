'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, ColumnDef, SortingState, RowSelectionState
} from '@tanstack/react-table';
import { OpsLayout } from '@/components/layout/OpsLayout';
import { useCases } from '@/hooks/useCase';
import { StatusBadge } from '@/components/case/StatusBadge';
import { SlaTimerBadge } from '@/components/case/SlaTimer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Case, CaseStatus } from '@nrn/shared';
import { formatDate } from '@nrn/shared';
import { useDebounce } from '@/hooks/useDebounce';
import { ChevronUp, ChevronDown, Download, ArrowUpDown } from 'lucide-react';
import Papa from 'papaparse';

export default function CasesPage() {
  const router = useRouter();
  const { cases, loading } = useCases();
  const [sorting, setSorting]   = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debounced = useDebounce(globalFilter, 300);

  const filtered = useMemo(() => {
    let data = cases;
    if (statusFilter) data = data.filter((c) => c.status === statusFilter);
    if (debounced) {
      const s = debounced.toLowerCase();
      data = data.filter((c) =>
        c.id.toLowerCase().includes(s) ||
        c.vehicle.plate.toLowerCase().includes(s) ||
        c.accidentRef.toLowerCase().includes(s)
      );
    }
    return data;
  }, [cases, debounced, statusFilter]);

  const columns: ColumnDef<Case>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} className="cursor-pointer" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} className="cursor-pointer" />
      ),
    },
    { accessorKey: 'id',           header: 'Case ID',    cell: ({ getValue }) => <span className="font-mono text-xs">{String(getValue()).slice(0, 8)}</span> },
    { accessorKey: 'vehicle.plate', header: 'Plate',     cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span> },
    { accessorKey: 'vehicle.make',  header: 'Vehicle',   cell: ({ row }) => `${row.original.vehicle.make} ${row.original.vehicle.model} ${row.original.vehicle.year}` },
    { accessorKey: 'assignedWorkshopId', header: 'Workshop', cell: ({ getValue }) => getValue() ? String(getValue()) : '—' },
    { accessorKey: 'status',        header: 'Status',    cell: ({ getValue }) => <StatusBadge status={getValue() as CaseStatus} /> },
    {
      id: 'sla',
      header: 'SLA',
      cell: ({ row }) => row.original.slaTimers?.length > 0 ? (
        <SlaTimerBadge timer={row.original.slaTimers[row.original.slaTimers.length - 1]} />
      ) : '—',
    },
    { accessorKey: 'createdAt',     header: 'Created',   cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'updatedAt',     header: 'Updated',   cell: ({ getValue }) => formatDate(getValue() as string) },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" onClick={() => router.push(`/cases/${row.original.id}`)}>
          View →
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, rowSelection, globalFilter: debounced },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  const exportCSV = () => {
    const rows = table.getFilteredRowModel().rows.map((r) => ({
      id: r.original.id,
      plate: r.original.vehicle.plate,
      vehicle: `${r.original.vehicle.make} ${r.original.vehicle.model}`,
      status: r.original.status,
      workshop: r.original.assignedWorkshopId ?? '',
      created: formatDate(r.original.createdAt),
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'nrn-cases.csv'; a.click();
  };

  return (
    <OpsLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Case Management</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-1 h-3 w-3" />Export CSV</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Input placeholder="Search case ID, plate, ref..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-xs" />
          <select className="rounded-md border px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {Object.values(CaseStatus).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          {loading ? <Skeleton className="h-64 w-full" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b bg-muted/50">
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          className="cursor-pointer px-4 py-3 text-left font-medium"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' ? <ChevronUp className="h-3 w-3" /> :
                             header.column.getIsSorted() === 'desc' ? <ChevronDown className="h-3 w-3" /> :
                             header.column.getCanSort() ? <ArrowUpDown className="h-3 w-3 opacity-30" /> : null}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30 even:bg-muted/10 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {Object.keys(rowSelection).length > 0 ? `${Object.keys(rowSelection).length} selected · ` : ''}
            {table.getFilteredRowModel().rows.length} total cases
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Prev</Button>
            <span className="px-2 py-1 text-muted-foreground">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
            <Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Next</Button>
          </div>
        </div>
      </div>
    </OpsLayout>
  );
}
