import { forwardRef } from "react"

import { cn } from "@/lib/utils"

/** Semantic table primitives on the Meridian surface tokens.
 *
 *  `Table` is always wrapped in its own horizontally scrollable container - a
 *  wide financial table must never make the whole page scroll sideways. The
 *  ref points at that scroll container, not the `<table>`, so callers can
 *  drive it (e.g. mouse-drag scrolling) without reaching past this component. */
const Table = forwardRef<HTMLDivElement, React.ComponentProps<"table">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-collapse text-sm", className)}
        {...props}
      />
    </div>
  )
)
Table.displayName = "Table"

/** The header sits on its own recessed band with a stronger closing rule, so it
 *  reads as a header and not as the first row of data. */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        // The rule lives on the cells, not the row: TableRow's `last:border-0`
        // would otherwise strip it, the header row being the last row in thead.
        "bg-table-head [&_th]:border-b [&_th]:border-hairline-strong",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn(className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-hairline transition-colors last:border-0 data-[interactive]:cursor-pointer hover:data-[interactive]:bg-row-hover",
        // The global focus ring uses a positive outline-offset, which on a row
        // draws over the neighbouring rows and gets clipped by the panel's
        // overflow-hidden. Inset it so the ring stays inside the row.
        "focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // text-mid, not text-low: the low tone only reached ~2.4:1 on the panel
        // and the labels read as disabled.
        "h-11 px-4 text-left align-middle text-[12px] font-medium text-text-mid whitespace-nowrap first:pl-5 last:pr-5",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // h-12 is a floor, not a fixed height: it keeps single-line rows from
        // collapsing next to the two-line ones, so the row rhythm stays even.
        "h-12 px-4 py-2.5 align-middle text-[13px] text-text-mid first:pl-5 last:pr-5",
        className
      )}
      {...props}
    />
  )
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow }
