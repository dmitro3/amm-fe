import React from 'react';
import { createStyles, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '60%',
    },
    text: {
      fontSize: '20px',
      color: theme.palette.type === 'light' ? '#4E4B66' : '#FFFFFF',
      fontWeight: 500,
    },
  }),
);

interface Props {
  name: string;
  value: string;
}

export const ValueTable: React.FC<Props> = ({ name, value }) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Typography className={classes.text}>{name}</Typography>
      <Typography className={classes.text}>{value}</Typography>
    </div>
  );
};
