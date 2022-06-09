import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    color: '#848E9C',
    fontSize: '16px',
    marginBottom: '4px',
  },
});

export const Title: React.FC<any> = (props) => {
  const classes = useStyles();

  return <Typography className={classes.root}>{props.children}</Typography>;
};
