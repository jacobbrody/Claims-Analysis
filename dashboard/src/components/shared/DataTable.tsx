import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T, idx: number) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T, idx: number) => string | number;
  onRowClick?: (row: T, idx: number) => void;
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, data, rowKey, onRowClick, emptyMessage }: Props<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        {emptyMessage || 'No claims match the current filters.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" role="table">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400
                  ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={rowKey ? rowKey(row, idx) : idx}
              onClick={() => onRowClick?.(row, idx)}
              className={`border-b border-gray-100 last:border-0 transition
                ${onRowClick ? 'cursor-pointer hover:bg-brand-50/40' : 'hover:bg-gray-50'}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 whitespace-nowrap
                    ${col.align === 'right' ? 'text-right tabular-nums' : col.align === 'center' ? 'text-center' : ''}`}
                >
                  {col.render(row, idx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
