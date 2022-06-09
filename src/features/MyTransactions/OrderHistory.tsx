import { BigNumber } from '@0x/utils';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { GridCellParams, GridColDef, GridOverlay } from '@material-ui/data-grid';
import { Pagination } from '@material-ui/lab';
import classnames from 'classnames/bind';
import _ from 'lodash';
import moment from 'moment';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FCXPoolIcon from 'src/assets/icon/pool/FCXPoolIcon';
import PancakeswapPoolIcon from 'src/assets/icon/pool/PancakeswapPoolIcon';
import CleanNumber from 'src/components/CleanNumber';
import CDataGrid from 'src/components/DataGrid';
import stylesPagition from 'src/components/Pagination/style';
import TooltipText from 'src/components/Tooltip/Tooltip';
import { TradingMethod } from 'src/constants/dashboard';
import eventBus from 'src/event/event-bus';
import {
  DEFAULT_PAGE,
  DELAY_TIME,
  EORDER_SIDE,
  EORDER_TYPE,
  FORMAT_DATE,
  MESSAGE_TABLE,
  METHOD_FILTER,
  ModeDisplay,
  ORDER_SIDE,
  ORDER_STATUS,
  ORDER_TYPE,
  OrderStatus,
  TFilter,
  TO_FIX_2,
} from 'src/features/MyTransactions/Constant';
import FilterBar from 'src/features/MyTransactions/FilterBar';
import styles from 'src/features/MyTransactions/MyTransaction.module.scss';
import { getOrderHistoryApi } from 'src/features/MyTransactions/MyTransactions.slice';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { getAmountPrecision } from 'src/features/SwapForm/helpers/getPairAttributes';
import { disableDragDrop } from 'src/helpers/disableDragDrop';
import { fixPrecision } from 'src/helpers/fixPrecision';
import { sleep } from 'src/helpers/share';
import { THEME_MODE } from 'src/interfaces/theme';
import { SocketEvent } from 'src/socket/SocketEvent';
import { useAppSelector } from 'src/store/hooks';
import store, { RootState } from 'src/store/store';
import { getFilterSize } from './MyTransactions';

const cx = classnames.bind(styles);

interface IOrderHistory {
  limitRecord?: number;
  modeDisplay: ModeDisplay;
}

export const OrderHistory: React.FC<IOrderHistory> = (props) => {
  const dispatch = useDispatch();
  const theme = store.getState().theme.themeMode;
  const pairList: Pair[] = useAppSelector((state) => state.allPairs.pairs.data);
  const walletList: any = useSelector((state: RootState) => state.myTransaction.wallets.data);
  const orderList: any = useSelector((state: RootState) => state.myTransaction.orderHistory.data);
  const [orders, setOrders] = useState(orderList);
  const totalPage = useAppSelector((state) => state.myTransaction.orderHistory.metadata.totalPage);
  const classes = stylesPagition();
  const pairs = useAppSelector((state) => state.pair.pairs);

  const [conditionFilterOrderHistory, setConditionFilterOrderHistory] = useState<TFilter>({
    page: DEFAULT_PAGE,
    limit: props.limitRecord,
    method: METHOD_FILTER.map((item) => item.value),
    status: [OrderStatus.Fulfill, OrderStatus.PartiallyFilled, OrderStatus.Canceled],
  });

  useEffect(() => {
    setOrders(orderList);
  }, [orderList]);

  const customRow = () => {
    const rows = _.cloneDeep(orders);
    rows.map((row: any) => {
      const pair = pairList?.find((e: Pair) => e.pairs_id === row.pair_id);

      //custom order pair
      row.pair = row.base_name + '/' + row.quote_name;

      //custom filled
      if (new BigNumber(row.filled_amount).gte(0)) {
        if (new BigNumber(row.total || '0').gt('0')) {
          row.executed = fixPrecision(((row.filled_amount * row.average) / row.total) * 100, TO_FIX_2) + '%';
        } else {
          row.executed = fixPrecision((row.filled_amount / row.amount) * 100, TO_FIX_2) + '%';
        }
      } else {
        row.executed = '-';
      }

      // custom order type
      if (row.type === EORDER_TYPE.Market) {
        row.type = ORDER_TYPE.MARKET;
        row.price = ORDER_TYPE.MARKET;
        if (new BigNumber(row.total || '0').gt('0')) {
          row.amount = fixPrecision(new BigNumber(row.total).div(row.average), pair?.amount_precision);
          row.total = fixPrecision(row.total, pair?.amount_precision);
        } else {
          row.total = row.average
            ? fixPrecision(new BigNumber(row.average).times(row.amount), pair?.amount_precision)
            : '-';
          //custom amount
          row.amount = fixPrecision(row.amount, pair?.amount_precision);
        }
      } else {
        //custom price
        row.price = fixPrecision(row.price, pair?.price_precision);
        row.type = ORDER_TYPE.LIMIT;
        // custom total
        row.total = row.average
          ? fixPrecision(new BigNumber(row.average).times(row.amount), pair?.amount_precision)
          : '-';
        //custom amount
        row.amount = fixPrecision(row.amount, pair?.amount_precision);
      }

      //custom average
      row.average = row.average && row.average !== '0' ? fixPrecision(row.average, pair?.price_precision) : '-';

      //custom order side
      if (row.side === EORDER_SIDE.Buy) {
        row.side = ORDER_SIDE.BUY;
      } else row.side = ORDER_SIDE.SELL;

      //custom order status
      if (row.status === OrderStatus.Canceled) {
        row.status = ORDER_STATUS.CANCELED;
      } else if (row.status === OrderStatus.Fulfill) {
        row.status = ORDER_STATUS.FILLED;
      } else if (row.status === OrderStatus.PartiallyFilled) {
        row.status = ORDER_STATUS.PARTIALLY;
      }

      row.created_at = moment(row.created_at).format(FORMAT_DATE);
    });
    return rows;
  };

  const COLUMNS: GridColDef[] = [
    { field: 'pair', headerName: 'Pair' },
    { field: 'created_at', headerName: 'Date' },
    { field: 'type', headerName: 'Type' },
    {
      field: 'side',
      headerName: 'Side',
      renderCell: (params: GridCellParams) => {
        const cellValue = params.value;
        return (
          <span className={cx(`text-side${cellValue === ORDER_SIDE.BUY ? '-buy' : '-sell'}`)}>{params.value}</span>
        );
      },
    },
    { field: 'average', headerName: 'Average', width: 150 },
    { field: 'price', headerName: 'Price', width: 150 },
    { field: 'amount', headerName: 'Amount', width: 150 },
    {
      field: 'total',
      headerName: 'Total',
      renderCell: (params: GridCellParams) => {
        let precision;
        if (pairs) {
          const pairInRow = pairs.find((i: any) => {
            return i.pair_id === params.row.pairs_id;
          });
          if (pairInRow) {
            precision = getAmountPrecision(pairInRow);
          }
        }

        const roundedNumber = precision ? new BigNumber(params.row.total).dp(precision).toString() : params.row.total;
        return (
          <>
            <CleanNumber number={roundedNumber} maxDigits={10} fixedDecimal={precision} errorNumberText={'-'} />
          </>
        );
      },
    },
    { field: 'executed', headerName: 'Executed' },
    {
      field: 'pool_id',
      headerName: 'Pool',
      width: 200,
      renderCell: (params: GridCellParams) => {
        const tradingMethod: TradingMethod = params.row.method;
        return (
          <div className={cx('pool-data-container')}>
            {tradingMethod === TradingMethod.PancakeswapPool ? (
              <PancakeswapPoolIcon size={'sm'} />
            ) : tradingMethod === TradingMethod.BSCPool ? (
              <FCXPoolIcon size={'sm'} />
            ) : (
              <></>
            )}
            <div
              className={cx('div-link')}
              onClick={() => {
                if (tradingMethod === TradingMethod.BSCPool) {
                  window.open(`/pools/${params.value}`);
                }
                if (tradingMethod === TradingMethod.PancakeswapPool) {
                  window.open(`${process.env.REACT_APP_PANCAKE_POOL}/pool/${params.value}`);
                }
              }}
            >
              <TooltipText content={params.value} />
            </div>
          </div>
        );
      },
    },
    { field: 'id', headerName: 'Order ID' },
    {
      field: 'address',
      headerName: 'Wallet',
      width: 200,
      renderCell: (params: GridCellParams) => {
        return <TooltipText content={params.value} />;
      },
    },
    { field: 'status', headerName: 'Status' },
  ];

  useEffect(() => {
    dispatch(getOrderHistoryApi(conditionFilterOrderHistory));
    eventBus.on(SocketEvent.OrdersUpdated, async () => {
      await sleep(DELAY_TIME);
      dispatch(getOrderHistoryApi(conditionFilterOrderHistory));
    });
    disableDragDrop('data-grid');
  }, []);

  const handleFilterCondition = (condition: TFilter) => {
    condition.page = DEFAULT_PAGE;
    condition.limit = props.limitRecord;
    dispatch(getOrderHistoryApi(condition));
    setConditionFilterOrderHistory(condition);
  };

  const lightTheme = createMuiTheme({
    palette: {
      type: 'light',
    },
  });

  const darkTheme = createMuiTheme({
    palette: {
      type: 'dark',
    },
  });

  const customNoRowOverlay = (): ReactElement => {
    return (
      <GridOverlay>
        <div className={cx('text-no-record')}>
          {conditionFilterOrderHistory.pair || conditionFilterOrderHistory.method?.length !== METHOD_FILTER.length
            ? MESSAGE_TABLE.NOT_FOUND
            : MESSAGE_TABLE.NO_RECORD}
        </div>{' '}
      </GridOverlay>
    );
  };

  const handleChangePage = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilterOrderHistory.page = value;
    dispatch(getOrderHistoryApi(conditionFilterOrderHistory));
    setConditionFilterOrderHistory(conditionFilterOrderHistory);
  };

  return (
    <>
      <FilterBar
        itemFilter={['pair', 'method', 'wallet']}
        pairList={pairList}
        walletList={walletList}
        handleFilterCondition={handleFilterCondition}
        conditionFilter={conditionFilterOrderHistory}
        size={getFilterSize(props.modeDisplay)}
        modeDisplay={props.modeDisplay}
      />
      <div id="data-grid" className={cx(`data-grid-wrap-${getFilterSize(props.modeDisplay)}`)}>
        <ThemeProvider theme={theme == THEME_MODE.LIGHT ? lightTheme : darkTheme}>
          <CDataGrid
            rows={customRow()}
            columns={COLUMNS.map((column) => ({
              ...column,
              sortable: false,
              flex: props.modeDisplay === ModeDisplay.dashboard ? 0 : 1,
            }))}
            disableColumnMenu
            hideFooterPagination
            hideFooterRowCount
            hideFooterSelectedRowCount
            hideFooter
            components={{
              NoRowsOverlay: customNoRowOverlay,
            }}
          />
        </ThemeProvider>
      </div>
      {props.modeDisplay !== ModeDisplay.dashboard && totalPage > 1 && (
        <div className={cx('footer-pagination')}>
          <Pagination
            className={classes.pagination}
            count={totalPage}
            page={conditionFilterOrderHistory.page}
            variant="outlined"
            shape="rounded"
            onChange={handleChangePage}
          />
        </div>
      )}
    </>
  );
};
