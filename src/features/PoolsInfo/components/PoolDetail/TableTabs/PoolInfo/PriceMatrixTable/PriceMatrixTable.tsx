import {
  createStyles,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  withStyles,
} from '@material-ui/core';
import React from 'react';
import { calculatePriceMatrix } from 'src/features/PoolsInfo/helpers/priceMatrix';
import { Pool } from 'src/interfaces/pool';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      width: 'fit-content',
      maxWidth: '100%',
      overflowX: 'auto',
      borderRadius: '5px 5px 0 0',
    },
    text: {
      fontSize: '12px',
      color: '#848E9C',
      fontWeight: 500,
    },
    table: {
      width: 'auto',
      backgroundColor: theme.palette.type === 'light' ? '#FAFAFA' : '#3D4045',
    },
    cell: {
      border: '1px solid' + theme.palette.type === 'light' ? '#e0e0e0' : '#3d4045',
    },
  }),
);

const CustomTableRow = withStyles(
  (theme) => ({
    root: {
      lineHeight: '0.5em',
      backgroundColor: theme.palette.type === 'light' ? '#E6E8EA' : '#3D4045',
    },
  }),
  { withTheme: true },
)(TableRow);

export const PriceMatrixTable: React.FC<{ pool: Pool }> = ({ ...props }) => {
  const classes = useStyles();

  return (
    <TableContainer className={classes.container}>
      <Table className={classes.table} aria-label="simple table">
        <TableBody>
          <CustomTableRow>
            <TableCell className={classes.text} align="left">
              Asset 2 \ Asset 1
            </TableCell>
            {props.pool.tokens.map((item, key) => {
              return (
                <TableCell key={key} className={classes.text} align="center">
                  {item.symbol}
                </TableCell>
              );
            })}
          </CustomTableRow>

          {props.pool.tokens.map((rowToken, rowTokenKey) => {
            return (
              <CustomTableRow key={rowTokenKey}>
                <TableCell className={classes.text} align="left">
                  {rowToken.symbol}
                </TableCell>
                {props.pool.tokens.map((colToken, colTokenKey) => {
                  return (
                    <TableCell key={colTokenKey} className={classes.text} align="center">
                      {calculatePriceMatrix(rowToken, colToken)}
                    </TableCell>
                  );
                })}
              </CustomTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
