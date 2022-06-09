import React from 'react';
import { createStyles, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      fontSize: '20px',
      color: theme.palette.type === 'light' ? '#4E4B66' : '#FFFFFF',
      fontWeight: 500,
    },
  }),
);

export const Value: React.FC = (props: any) => {
  const classes = useStyles();

  return <Typography className={classes.root}>{props.children}</Typography>;
};
