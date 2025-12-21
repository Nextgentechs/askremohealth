'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type LabTestAvailable } from '@web/types/globals'

export const columns: ColumnDef<LabTestAvailable>[] = [
  {
    accessorKey: 'test.name',
    header: 'Test Name',
    cell: ({ row }) => row.original.test?.name ?? 'N/A',
  },
  {
    accessorKey: 'test.generalCategory',
    header: 'General Category',
    cell: ({ row }) => row.original.test?.generalCategory ?? 'N/A',
  },
  {
    accessorKey: 'test.specificCategory',
    header: 'Specific Category',
    cell: ({ row }) => row.original.test?.specificCategory ?? 'N/A',
  },
  {
    accessorKey: 'test.sampleType',
    header: 'Sample Type',
    cell: ({ row }) => row.original.test?.sampleType ?? 'N/A',
  },
  {
    accessorKey: 'collection',
    header: 'Collection Method',
    cell: ({ row }) => row.original.collection ?? 'N/A',
  },
  {
    accessorKey: 'amount',
    header: 'Price (KES)',
    cell: ({ row }) => `KES ${row.original.amount?.toLocaleString() ?? 'N/A'}`,
  },
]
