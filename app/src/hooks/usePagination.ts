import { useState, Dispatch, SetStateAction } from 'react';

export interface IPaginationProps {
  current: number;
  pageSize: number;
  total: number;
}

export const usePagination: (
  init: IPaginationProps
) => [IPaginationProps, Dispatch<SetStateAction<IPaginationProps>>] = (
  props: IPaginationProps
) => {
  const [pagination, setPagination] = useState<IPaginationProps>(props);
  return [pagination, setPagination];
};
