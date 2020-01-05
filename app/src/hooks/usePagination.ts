import { useState } from 'react';

export interface IPaginationProps {
  current: number;
  pageSize: number;
  total: number;
}

export const usePagination = (
  props: IPaginationProps
) => {
  const [pagination, setPagination] = useState<IPaginationProps>(props);
  return [pagination, setPagination]
};
