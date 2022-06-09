import { createStyles, makeStyles } from '@material-ui/core';
import { useGridSlotComponentProps } from '@material-ui/data-grid';
import Pagination from '@material-ui/lab/Pagination';
import React, { FC } from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(0),
      },
    },
  }),
);

const StyledPagination: FC = () => {
  const { state, apiRef } = useGridSlotComponentProps();
  const classes = useStyles();

  return (
    <Pagination
      className={classes.root}
      color="primary"
      count={state.pagination.pageCount}
      page={state.pagination.page + 1}
      variant="outlined"
      shape="rounded"
      onChange={(event, value) => apiRef.current.setPage(value - 1)}
    />
  );
};

export default StyledPagination;
