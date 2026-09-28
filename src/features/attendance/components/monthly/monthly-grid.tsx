import { useEffect, useRef } from 'react';

import { parseISO } from 'date-fns';
import { AlertTriangle, ChevronRight } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Pagination } from '@/lib/api/types';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { DataTablePagination } from '@/systems/table/data-table-pagination';

import type { MonthlyDay, MonthlyRow } from '../../definitions/attendance-monthly.types';
import { MonthlyDayCell } from './monthly-day-cell';

type Props = {
  rows: MonthlyRow[];
  isLoading: boolean;
  emptyState: React.ReactNode;
  pagination?: Pagination;
  onPageChange: (page: number) => void;
  /** A cell is a jump to that employee's day on the roster, which is where it
   *  can actually be fixed. */
  onSelectDay: (row: MonthlyRow, day: MonthlyDay) => void;
  onSelectRow: (row: MonthlyRow) => void;
};

const SKELETON_DAYS = 31;

export function MonthlyGrid({
  rows,
  isLoading,
  emptyState,
  pagination,
  onPageChange,
  onSelectDay,
  onSelectRow,
}: Props) {
  const days = rows[0]?.days ?? [];
  const scrollRef = useDragScroll<HTMLDivElement>();

  if (!rows.length) {
    return (
      <div className="m-panel m-panel-shine overflow-hidden">
        {isLoading ? <GridSkeleton /> : emptyState}
      </div>
    );
  }

  return (
    <div className="m-panel m-panel-shine overflow-hidden">
      <Table
        ref={scrollRef}
        className={cn(isLoading && 'opacity-60 transition-opacity')}
      >
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-20 w-36 bg-table-head sm:w-52 sm:min-w-52">
              Employee
            </TableHead>

            {days.map(day => (
              <TableHead key={day.date} className="h-11 px-0.5 text-center sm:px-1">
                <span data-numeric className="block text-[12px] text-text-hi">
                  {formatDate(parseISO(day.date), 'd')}
                </span>
                <span className="block text-[10px] font-normal text-text-low">
                  {formatDate(parseISO(day.date), 'EEEEE')}
                </span>
              </TableHead>
            ))}

            <TableHead className="text-right">Totals</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map(row => (
            <TableRow key={row.employee.id} className="group/row">
              <TableCell className="sticky left-0 z-10 w-36 bg-surface-1 pr-2 group-hover/row:bg-surface-2 sm:w-52 sm:pr-3">
                <div className="w-32 sm:w-auto">
                  <span className="block font-medium text-text-hi">{row.employee.fullName}</span>
                  <span className="block text-[11px] text-text-low">
                    <span data-numeric className="font-mono tracking-wide">
                      {row.employee.employeeId}
                    </span>
                    {/* Dropped on a phone: it wraps to a second and third line and
                        the column is what the day cells are competing with. */}
                    {row.employee.designation ? (
                      <span className="hidden sm:inline"> Â· {row.employee.designation}</span>
                    ) : null}
                  </span>
                </div>

                {row.reconciles ? null : (
                  <span
                    className="mt-1 flex items-center gap-1 text-[11px] text-overdue"
                    title="The buckets do not sum to the eligible days. The month will not lock until this is settled."
                  >
                    <AlertTriangle aria-hidden className="size-3 shrink-0" />
                    <span className="sm:hidden">Unsettled</span>
                    <span className="hidden sm:inline">Does not reconcile</span>
                  </span>
                )}
              </TableCell>

              {row.days.map(day => (
                <TableCell key={day.date} className="px-0.5 py-1.5 sm:px-1">
                  <MonthlyDayCell
                    day={day}
                    employeeName={row.employee.fullName}
                    onSelect={() => onSelectDay(row, day)}
                  />
                </TableCell>
              ))}

              <TableCell className="text-right">
                <button
                  type="button"
                  onClick={() => onSelectRow(row)}
                  className="ml-auto flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors duration-200 hover:bg-surface-3"
                  aria-label={`Totals for ${row.employee.fullName}`}
                >
                  <span className="flex items-baseline gap-2 whitespace-nowrap">
                    <Tally label="P" value={row.totals?.presentDays ?? 0} />
                    <Tally label="A" value={row.totals?.absentDays ?? 0} />
                    <Tally label="L" value={row.totals?.paidLeaveDays ?? 0} />
                  </span>
                  <ChevronRight aria-hidden className="size-4 text-text-low" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination ? (
        <DataTablePagination pagination={pagination} onPageChange={onPageChange} />
      ) : null}
    </div>
  );
}

function Tally({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="meta-label text-text-low">
        {label}
      </span>
      <span data-numeric className="text-[13px] font-medium text-text-hi">
        {value}
      </span>
    </span>
  );
}

/** Mouse-drag panning for the day columns. Touch already scrolls natively;
 *  desktop only has the native scrollbar, which sits below every row and
 *  forces a scroll-to-bottom before it can be reached. A click that moves
 *  past the threshold is flagged so the day-cell click it would otherwise
 *  fire on release is swallowed, not treated as a day selection. */
function useDragScroll<T extends HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.add('cursor-grab');

    let isDown = false;
    let dragged = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      dragged = false;
      startX = e.pageX;
      startScrollLeft = el.scrollLeft;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const delta = e.pageX - startX;
      if (Math.abs(delta) > 3) dragged = true;
      if (dragged) {
        e.preventDefault();
        el.scrollLeft = startScrollLeft - delta;
        el.classList.add('cursor-grabbing');
      }
    };

    const onMouseUp = () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
    };

    const onClickCapture = (e: MouseEvent) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  return ref;
}

/** Sized to a full month so the first paint is the same height as the loaded
 *  grid and the page does not jump when the cycle arrives. */
function GridSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }, (_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 shrink-0 sm:w-48" />
          <div className="flex gap-1 overflow-hidden">
            {Array.from({ length: SKELETON_DAYS }, (_, dayIndex) => (
              <Skeleton key={dayIndex} className="size-8 shrink-0 rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
