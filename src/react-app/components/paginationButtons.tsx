import {
  Table,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectCustom } from '@/components/selectCustom';


export const PaginationButtons = <TData,>({
  table,
  pagination,
}: {
  table: Table<TData>,
  pagination: { pageIndex: number, pageSize: number }
}) => {
  return (
    <div className='flex justify-between my-2'>
      <div className='text-gray-500'>
        {table.getFilteredRowModel().rows.length.toLocaleString()} resultados
      </div>
      <div className='flex gap-2'>
        <Button
          type="button"
          variant="outline"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </Button>
        <Input
          className='max-w-15 text-center'
          value={pagination.pageIndex + 1}
          onChange={(e) => {
            if (!e.target.value) {
              table.setPageIndex(0);
              return;
            }
            if (isNaN(Number(e.target.value))) return;
            let value = Number(e.target.value);
            if (value < 1) value = 1;
            if (value > table.getPageCount()) value = table.getPageCount();
            table.setPageIndex(value - 1);
          }}
        />
        <Button
        type="button"
        variant="outline"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        >
          {'>'}
        </Button>
        <Button
        type="button"
        variant="outline"
        onClick={() => table.lastPage()}
        disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </Button>
        <SelectCustom
          id="pageSize"
          name="pageSize"
          options={[10, 20, 30, 40, 50].map((pageSize) => ({ value: pageSize.toString(), label: pageSize.toString() }))}
          value={table.getState().pagination.pageSize.toString()}
          onChange={(e) => {
            table.setPageSize(Number(e))
          }}
          width='w-20'
        />
      </div>
    </div>
  )
}