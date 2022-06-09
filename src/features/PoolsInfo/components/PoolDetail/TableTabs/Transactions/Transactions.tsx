import { makeStyles, MenuItem, Select } from '@material-ui/core';
import { GridCellParams, GridPageChangeParams, GridValueFormatterParams } from '@material-ui/data-grid';
import classnames from 'classnames/bind';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import CDataGrid from 'src/components/DataGrid';
import { CustomLoadingOverlay, NoRows } from 'src/components/DataGrid/DataGrid';
import Pagination from 'src/components/Pagination';
import { TRANSACTION_TYPES } from 'src/features/PoolsInfo/constants/transaction-types';
import { formatPoolNumber, setDataPrecision } from 'src/features/PoolsInfo/helpers/dataFormatter';
import { disableDragDrop } from 'src/helpers/disableDragDrop';
import { Pool } from 'src/interfaces/pool';
import { PER_PAGE } from 'src/pages/PoolsList/constants';
import { TokenIcon } from 'src/pages/PoolsList/helpers/TokenIcon';
import { getAddsByPool, getSwapsByPool, getWithdrawsByPool } from 'src/services/pool';
import { useAppSelector } from 'src/store/hooks';
import stylesSCSS from './Transactions.module.scss';
import { ReactComponent as ArrowDownIcon } from 'src/assets/icon/Arrow-Down.svg';

const cx = classnames.bind(stylesSCSS);

interface Props {
  pool: Pool;
}
interface IObject {
  [key: string]: any;
}

const useStyles = makeStyles({
  header: {
    '& .MuiDataGrid-columnHeader:focus-within': {
      outline: 'none',
    },

    '& .MuiDataGrid-cell:focus-within': {
      outline: 'none',
    },

    '& .MuiDataGrid-columnsContainer': {
      flexDirection: 'row',
    },
  },

  select: {
    '&&&:before, &&&:after': {
      borderBottom: 'none',
    },

    '& .MuiSelect-select': {
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '14px',
      lineHeight: '20px',
      color: 'var(--color-body)',
      padding: 0,
      paddingRight: '16px',
      opacity: 1,
    },

    '& .MuiSelect-select:focus': {
      background: 'none',
    },

    '& svg': {
      cursor: 'pointer',
      position: 'absolute',
      right: 0,

      pointerEvents: 'none',
    },
  },

  menus: {
    '& li': {
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '12px',
      lineHeight: '16px',
      color: 'var(--color-body)',
    },
  },
});

export const Transactions: React.FC<Props> = ({ pool }) => {
  const coins = useAppSelector((state) => state.allCoins.coins.data);
  const styles = useStyles();
  const [type, setType] = useState(TRANSACTION_TYPES.SWAP);
  const [swaps, setSwaps] = useState<Array<any>>([]);
  const [adds, setAdds] = useState<Array<any>>([]);
  const [swapsRowCount, setSwapsRowCount] = useState<number>(0);
  const [addsRowCount, setAddsRowCount] = useState<number>(0);
  const [withdrawsRowCount, setWithdrawsRowCount] = useState<number>(0);

  const [withdraws, setWithdraws] = useState<Array<any>>([]);

  const handleChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    setType(event.target.value as number);
  };

  const timeColumnFormatter = (params: GridValueFormatterParams) => {
    return moment.unix(Number(params.value)).format('DD/MM/YYYY HH:mm:ss');
  };

  const transactionSelector = () => (
    <Select
      value={type}
      onChange={handleChange}
      className={styles.select}
      IconComponent={() => <ArrowDownIcon />}
      MenuProps={{
        className: styles.menus,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        getContentAnchorEl: null,
      }}
    >
      <MenuItem className={cx('header-text-style')} value={TRANSACTION_TYPES.SWAP}>
        Swap
      </MenuItem>
      <MenuItem className={cx('header-text-style')} value={TRANSACTION_TYPES.ADD}>
        Add
      </MenuItem>
      <MenuItem className={cx('header-text-style')} value={TRANSACTION_TYPES.REMOVE}>
        Remove
      </MenuItem>
    </Select>
  );

  const transactionHyperLink = (params: GridCellParams) => (
    <a
      className={cx('transaction-hyperlink', 'transaction-text-style')}
      href={`${process.env.REACT_APP_ETHERSCAN}/tx/${params.row.transaction.id}`}
      target="_blank"
      rel="noreferrer"
    >
      {params.row.transaction.text}
    </a>
  );
  const swapColumns = [
    {
      field: 'transaction',
      sortable: false,
      headerName: 'Transaction',
      renderHeader: transactionSelector,
      renderCell: transactionHyperLink,
      headerClassName: cx('transactions-type-select-container'),
      flex: 1,
    },
    {
      field: 'priceFrom',
      sortable: false,
      headerName: 'Digital credit amount',
      headerClassName: cx('header-text-style'),
      cellClassName: cx('transaction-text-style'),
      flex: 1,
    },
    {
      field: 'priceTo',
      sortable: false,
      headerName: 'Digital credit amount',
      headerClassName: cx('header-text-style'),
      cellClassName: cx('transaction-text-style'),
      flex: 1,
    },
    {
      field: 'time',
      sortable: false,
      headerName: 'Time',
      valueFormatter: timeColumnFormatter,
      headerClassName: cx('header-text-style'),
      cellClassName: cx('transaction-text-style'),
      flex: 1,
    },
  ];

  const renderAddRemoveDetails = (params: GridCellParams) => {
    return (
      <div className={cx('add-remove-details')}>
        {params.row.tokens.map?.((item: IObject, index: number) => (
          <>
            <div key={index}>
              <TokenIcon name={item.symbol} size={15} />
              <div>{item.amount}</div>
            </div>
            {index === 3 && <hr className={cx('tokens-detail-break')} />}
          </>
        ))}
      </div>
    );
  };

  const addRemoveColumns = [
    {
      field: 'transaction',
      headerName: 'Transaction',
      sortable: false,
      renderHeader: transactionSelector,
      renderCell: transactionHyperLink,
      headerClassName: cx('transactions-type-select-container'),
      flex: 0.5,
    },
    {
      type: 'string',
      field: 'tokens',
      sortable: false,
      headerName: 'Details',
      flex: 2,
      headerClassName: cx('header-text-style'),
      cellClassName: cx('transaction-text-style'),
      renderCell: renderAddRemoveDetails,
    },
    {
      field: 'time',
      sortable: false,
      headerName: 'Time',
      headerClassName: cx('header-text-style'),
      cellClassName: cx('transaction-text-style'),
      valueFormatter: timeColumnFormatter,
      flex: 1,
    },
  ];

  const [loading, setLoading] = useState(false);

  const tokensList = coins.map((item: IObject) => {
    return { address: item.bsc_address, symbol: item.symbol };
  });

  const getSwaps = async (page: number) => {
    setLoading(true);
    const res = await getSwapsByPool(pool.id, page, PER_PAGE);
    setSwapsRowCount(res.pool.swapsCount);

    const swaps = res.pool.swaps.map((item: IObject, key: string) => {
      const swapId = item.id.substring(0, item.id.indexOf('-'));
      return {
        id: key,
        transaction: { text: `Swap ${item.tokenInSym} for ${item.tokenOutSym}`, id: swapId },
        priceFrom: `${formatPoolNumber(item.tokenAmountIn, 2)} ${item.tokenInSym}`,
        priceTo: `${formatPoolNumber(item.tokenAmountOut, 2)} ${item.tokenOutSym}`,
        time: item.timestamp,
      };
    });
    setSwaps(swaps);
    setLoading(false);
  };

  const getAdds = async (page: number) => {
    setLoading(true);
    const res = await getAddsByPool(pool.id, page, PER_PAGE);
    setAddsRowCount(res.pool.joinsCount);

    const adds = res.pool.adds.map((item: IObject, key: string) => {
      const tokens = item.tokens.map((token: IObject) => {
        const coin = tokensList.find((item) => item.address.toLowerCase() == token.tokenIn.toLowerCase());
        return { symbol: coin?.symbol, address: token.tokenIn, amount: setDataPrecision(token.tokenAmountIn, 2) };
      });

      return {
        id: key,
        transaction: { text: 'Add liquidity', id: item.id },
        tokens: tokens,
        time: item.timestamp,
      };
    });
    setAdds(adds);
    setLoading(false);
  };

  const getWithdraws = async (page: number) => {
    setLoading(true);
    const res = await getWithdrawsByPool(pool.id, page, PER_PAGE);
    setWithdrawsRowCount(res.pool.exitsCount);

    const withdraws = res.pool.withdraws.map((item: IObject, key: string) => {
      const tokens = item.tokens.map((token: IObject) => {
        const coin = tokensList.find((item) => item.address.toLowerCase() == token.tokenOut.toLowerCase());
        return { symbol: coin?.symbol, address: token.tokenOut, amount: setDataPrecision(token.tokenAmountOut, 2) };
      });

      return {
        id: key,
        transaction: { text: 'Remove liquidity', id: item.id },
        tokens: tokens,
        time: item.timestamp,
      };
    });

    setWithdraws(withdraws);
    setLoading(false);
  };

  useEffect(() => {
    if (type == TRANSACTION_TYPES.SWAP) {
      getSwaps(0);
    }
    if (type == TRANSACTION_TYPES.ADD) {
      getAdds(0);
    }
    if (type == TRANSACTION_TYPES.REMOVE) {
      getWithdraws(0);
    }
  }, [type, pool.liquidity]);

  useEffect(() => {
    disableDragDrop('data-grid');
  }, []);

  return (
    <div id="data-grid">
      {type === TRANSACTION_TYPES.SWAP && (
        <CDataGrid
          className={styles.header}
          rows={swaps}
          columns={swapColumns}
          pageSize={PER_PAGE}
          rowCount={swapsRowCount}
          hideFooterRowCount
          hideFooterSelectedRowCount
          hideFooterPagination={swapsRowCount / PER_PAGE < 2}
          disableColumnReorder={true}
          disableColumnMenu
          autoHeight
          components={{
            Pagination,
            LoadingOverlay: CustomLoadingOverlay,
            NoRowsOverlay: NoRows,
          }}
          paginationMode="server"
          onPageChange={(params: GridPageChangeParams) => {
            getSwaps(params.page);
          }}
          loading={loading}
          headerHeight={36}
          rowHeight={44}
        />
      )}
      {type === TRANSACTION_TYPES.ADD && (
        <CDataGrid
          className={styles.header}
          rows={adds}
          columns={addRemoveColumns}
          pageSize={PER_PAGE}
          rowCount={addsRowCount}
          hideFooterRowCount
          hideFooterSelectedRowCount
          hideFooterPagination={addsRowCount / PER_PAGE < 2}
          disableColumnReorder={true}
          disableColumnMenu
          autoHeight
          components={{
            Pagination,
            LoadingOverlay: CustomLoadingOverlay,
            NoRowsOverlay: NoRows,
          }}
          paginationMode="server"
          onPageChange={(params: GridPageChangeParams) => {
            getAdds(params.page);
          }}
          loading={loading}
          headerHeight={36}
          rowHeight={70}
        />
      )}
      {type === TRANSACTION_TYPES.REMOVE && (
        <CDataGrid
          className={styles.header}
          rows={withdraws}
          columns={addRemoveColumns}
          rowCount={withdrawsRowCount}
          components={{
            Pagination,
            LoadingOverlay: CustomLoadingOverlay,
            NoRowsOverlay: NoRows,
          }}
          paginationMode="server"
          onPageChange={(params: GridPageChangeParams) => {
            getWithdraws(params.page);
          }}
          loading={loading}
          headerHeight={36}
          pageSize={PER_PAGE}
          hideFooterRowCount
          hideFooterSelectedRowCount
          hideFooterPagination={withdrawsRowCount / PER_PAGE < 2}
          disableColumnReorder={true}
          disableColumnMenu
          autoHeight
          rowHeight={70}
        />
      )}
    </div>
  );
};
