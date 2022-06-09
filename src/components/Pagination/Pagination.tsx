import { useGridSlotComponentProps } from '@material-ui/data-grid';
import Pagination from '@material-ui/lab/Pagination';
import React, { FC } from 'react';
import stylesPagition from 'src/components/Pagination/style';

const CustomPagination: FC = () => {
  const { state, apiRef } = useGridSlotComponentProps();
  const classes = stylesPagition();
  return (
    <Pagination
      className={classes.pagination}
      color="primary"
      count={state.pagination.pageCount}
      page={state.pagination.page + 1}
      variant="outlined"
      shape="rounded"
      onChange={(event, value) => apiRef.current.setPage(value - 1)}
    />
  );
};
export default CustomPagination;
