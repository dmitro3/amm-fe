import { Box, createStyles, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      marginBottom: '18px',
      backgroundColor: theme.palette.type === 'light' ? '#FAFAFA' : '#2A2C33',
    },
  }),
);

export const InfoItem: React.FC = (props: any) => {
  const classes = useStyles();

  return <Box className={classes.root}>{props.children}</Box>;
};
