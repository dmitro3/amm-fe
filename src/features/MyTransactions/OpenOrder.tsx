/* eslint-disable react-hooks/exhaustive-deps */
import { BigNumber } from '@0x/utils';
import { Box, createMuiTheme, Dialog, IconButton, ThemeProvider, Typography } from '@material-ui/core';
import { GridCellParams, GridColDef, GridOverlay, GridRowSelectedParams } from '@material-ui/data-grid';
import CloseIcon from '@material-ui/icons/Close';
import { Pagination } from '@material-ui/lab';
import classnames from 'classnames/bind';
import _ from 'lodash';
import moment from 'moment';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { detailIconDark, detailIconLight } from 'src/assets/icon';
import WarningIcon from 'src/assets/icon/warning.svg';
import CButton from 'src/components/Base/Button/Button';
import Button from 'src/components/Base/Button/Button';
import CleanNumber from 'src/components/CleanNumber';
import CDataGrid from 'src/components/DataGrid';
import stylesPagition from 'src/components/Pagination/style';
import TooltipText from 'src/components/Tooltip/Tooltip';
import { ROUTE_SIDEBAR } from 'src/constants/accountSidebarRoute';
import { TradingMethod } from 'src/constants/dashboard';
import eventBus from 'src/event/event-bus';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';
import FilterBar from 'src/features/MyTransactions/FilterBar';
import styles from 'src/features/MyTransactions/MyTransaction.module.scss';
import { cancelOrderApi, getOpenOrdersApi } from 'src/features/MyTransactions/MyTransactions.slice';
import { StellarTransactionErrorCode } from 'src/features/OrderForm/constants/error';
import { cancelStellarOffer } from 'src/features/OrderForm/helpers/cancelStellarOffer';
import { openErrorSnackbar } from 'src/features/OrderForm/helpers/snackbar';
import { setOpenWrongFreighterAccountWarning } from 'src/features/OrderForm/redux/orderForm';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { getAmountPrecision } from 'src/features/SwapForm/helpers/getPairAttributes';
import TooltipHelp from 'src/features/User/Account/Dashboard/components/TooltipHelp';
import { disableDragDrop } from 'src/helpers/disableDragDrop';
import { fixPrecision } from 'src/helpers/fixPrecision';
import { sleep } from 'src/helpers/share';
import { getPublicKeyFromPrivateKey } from 'src/helpers/stellarHelper/address';
import { THEME_MODE } from 'src/interfaces/theme';
import { SocketEvent } from 'src/socket/SocketEvent';
import { useAppSelector } from 'src/store/hooks';
import store, { RootState } from 'src/store/store';
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
  ORDER_TYPE,
  OrderStatus,
  TFilter,
  TO_FIX_2,
} from './Constant';
import { getFilterSize } from './MyTransactions';

const cx = classnames.bind(styles);

interface IOpenOrder {
  limitRecord?: number;
  modeDisplay: ModeDisplay;
  currentScreen?: string;
}

export const OpenOrder: React.FC<IOpenOrder> = (props) => {
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState<GridRowSelectedParams>();
  const [isCancelOrder, setIsCancelOrder] = useState(false);
  const orderList: any = useSelector((state: RootState) => state.myTransaction.openOrders.data);
  const [orders, setOrders] = useState(orderList);
  const theme = store.getState().theme.themeMode;
  const [conditionFilterOpenOrder, setConditionFilterOpenOrder] = useState<TFilter>({
    page: DEFAULT_PAGE,
    limit: props.limitRecord,
    method: METHOD_FILTER.map((item) => item.value),
    status: [OrderStatus.Fillable, OrderStatus.Filling, OrderStatus.Pending],
  });
  const walletList: any = useSelector((state: RootState) => state.myTransaction.wallets.data);
  const wallet = useAppSelector((state) => state.wallet);
  const pairList: Pair[] = useAppSelector((state) => state.allPairs.pairs.data);
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);
  const [openCancelWarningDialog, setOpenCancelWarningDialog] = useState<boolean>(false);
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const totalPage = useAppSelector((state) => state.myTransaction.openOrders.metadata.totalPage);
  const isRefreshOpenOrder = useAppSelector((state) => state.myTransaction.refreshOrder);
  const classes = stylesPagition();
  const pairs = useAppSelector((state) => state.pair.pairs);

  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  const handleOpenCancelDialog = () => {
    setIsCanceling(false);
    setOpenCancelDialog(true);
  };
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  const handleOpenCancelWarningDialog = () => {
    setOpenCancelWarningDialog(true);
  };
  const handleCloseCancelWarningDialog = () => {
    setOpenCancelWarningDialog(false);
  };

  // wrong freighter account warning
  const handleOpenWrongFreighterAccountWarning = () => {
    dispatch(setOpenWrongFreighterAccountWarning(true));
  };

  useEffect(() => {
    dispatch(getOpenOrdersApi(conditionFilterOpenOrder));
    eventBus.on(SocketEvent.OrdersUpdated, async () => {
      await sleep(DELAY_TIME);
      dispatch(getOpenOrdersApi(conditionFilterOpenOrder));
    });
  }, [isRefreshOpenOrder]);
  useEffect(() => {
    setOrders(orderList);
  }, [orderList]);

  const cancelOrder = async (order: any) => {
    setIsCanceling(true);
    try {
      if (order.method === TradingMethod.StellarOrderbook) {
        if (
          wallet.freighter === order.address ||
          wallet.trezor.publicKey === order.address ||
          wallet.ledger.publicKey === order.address ||
          getPublicKeyFromPrivateKey(wallet.privateKey) === order.address
        ) {
          // cancel stellar offer
          const offerId = order.stellar_id.toString();
          const pair = pairList?.find((p: Pair) => p.pairs_id === order.pair_id);

          try {
            await cancelStellarOffer(offerId, wallet, pair);
          } catch (e) {
            if (e === StellarTransactionErrorCode.TX_BAD_AUTH) {
              if (wallet.freighter) {
                handleOpenWrongFreighterAccountWarning();
              } else {
                openErrorSnackbar(e);
              }
            }
          }
        } else {
          handleOpenCancelWarningDialog();
        }
      } else {
        await dispatch(cancelOrderApi(order.id));
        await dispatch(getOpenOrdersApi(conditionFilterOpenOrder));
      }
    } catch (e) {
      handleCloseCancelDialog();
    }
    handleCloseCancelDialog();
  };

  useEffect(() => {
    if (selectedRow && isCancelOrder) {
      cancelOrder(selectedRow.data);
      setIsCancelOrder(false);
    }
  }, [isCancelOrder, selectedRow]);

  const handleFilterCondition = (condition: TFilter) => {
    condition.page = DEFAULT_PAGE;
    condition.limit = props.limitRecord;
    dispatch(getOpenOrdersApi(condition));
    setConditionFilterOpenOrder(condition);
  };
  const customRow = () => {
    const rows = _.cloneDeep(orders);
    rows.map((row: any) => {
      const pair = pairList.find((e: Pair) => e.pairs_id === row.pair_id);
      //custom order pair
      row.pair = row.base_name + '/' + row.quote_name;

      //custom filled
      if (new BigNumber(row.filled_amount).gte(0)) {
        if (new BigNumber(row.total || '0').gt('0')) {
          row.filled_amount = fixPrecision(((row.filled_amount * row.average) / row.total) * 100, TO_FIX_2) + '%';
        } else {
          row.filled_amount = fixPrecision((row.filled_amount / row.amount) * 100, TO_FIX_2) + '%';
        }
      } else {
        row.filled_amount = '-';
      }

      if (row.type === EORDER_TYPE.Market) {
        row.type = ORDER_TYPE.MARKET;
        row.price = ORDER_TYPE.MARKET;
        if (new BigNumber(row.total || '0').gt('0')) {
          row.amount = '-';
          row.total = fixPrecision(row.total, pair?.amount_precision);
        } else {
          row.total = '-';
          //custom amount
          row.amount = fixPrecision(row.amount, pair?.amount_precision);
        }
      } else {
        //custom price
        row.price = fixPrecision(row.price, pair?.price_precision);
        row.type = ORDER_TYPE.LIMIT;
        // custom total
        row.total = row.amount ? fixPrecision(new BigNumber(row.price).times(row.amount), pair?.amount_precision) : '-';
        //custom amount
        row.amount = fixPrecision(row.amount, pair?.amount_precision);
      }

      //custom order side
      if (row.side === EORDER_SIDE.Buy) {
        row.side = ORDER_SIDE.BUY;
      } else {
        row.side = ORDER_SIDE.SELL;
      }
      row.created_at = moment(row.created_at).format(FORMAT_DATE);

      //custom amount
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
    { field: 'price', headerName: 'Price', width: 150 },
    { field: 'amount', headerName: 'Amount', width: 150 },
    {
      field: 'total',
      headerName: 'Total',
      width: 150,
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
    { field: 'filled_amount', headerName: 'Filled' },
    { field: 'id', headerName: 'Order ID' },
    {
      field: 'address',
      headerName: 'Wallet',
      width: 200,
      renderCell: (params: GridCellParams) => {
        return <div>{params.value ? <TooltipText content={params.value} /> : null}</div>;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: function column(p: GridCellParams) {
        return (
          <span>
            {p.row?.method === TradingMethod.BSCOrderbook ? 'Pending' : '-'}
            <span style={{ marginLeft: 4 }}>
              {p.row?.method === TradingMethod.BSCOrderbook && (
                <TooltipHelp
                  title={'Orders on BSC order book are processed on blockchain for some blocks before being activated'}
                />
              )}
            </span>
          </span>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: function column() {
        return (
          <span className={cx('text-cancel')} onClick={handleOpenCancelDialog}>
            Cancel
          </span>
        );
      },
    },
  ];

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
          {conditionFilterOpenOrder.pair || conditionFilterOpenOrder.method?.length !== METHOD_FILTER.length
            ? MESSAGE_TABLE.NOT_FOUND
            : MESSAGE_TABLE.NO_RECORD}
        </div>{' '}
      </GridOverlay>
    );
  };

  const NotFoundModeDisplay = (): ReactElement => {
    return (
      <GridOverlay>
        <div className={cx('text-no-record')}>
          {conditionFilterOpenOrder.pair || conditionFilterOpenOrder.method?.length !== METHOD_FILTER.length
            ? MESSAGE_TABLE.NOT_FOUND
            : MESSAGE_TABLE.NO_RECORD}
        </div>
      </GridOverlay>
    );
  };

  const handleChangePage = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilterOpenOrder.page = value;
    dispatch(getOpenOrdersApi(conditionFilterOpenOrder));
    setConditionFilterOpenOrder(conditionFilterOpenOrder);
  };

  // get short address
  const getShortAddress = (address: string) => {
    return !!address ? address.slice(0, 2) + '...' + address.slice(-4) : '...';
  };

  useEffect(() => {
    disableDragDrop('data-grid');
  }, []);

  return (
    <>
      <FilterBar
        itemFilter={['pair', 'method', 'wallet']}
        pairList={pairList}
        walletList={walletList}
        handleFilterCondition={handleFilterCondition}
        conditionFilter={conditionFilterOpenOrder}
        size={getFilterSize(props.modeDisplay)}
        modeDisplay={props.modeDisplay}
      />
      <div
        id="data-grid"
        className={cx(`data-grid-wrap-${getFilterSize(props.modeDisplay)}`)}
        style={{
          minHeight: props.modeDisplay === ModeDisplay.dashboard ? 400 : 580,
          overflowY: props.modeDisplay === ModeDisplay.dashboard ? 'auto' : 'hidden',
        }}
      >
        <ThemeProvider theme={theme == THEME_MODE.LIGHT ? lightTheme : darkTheme}>
          <CDataGrid
            rows={customRow()}
            columns={COLUMNS.map((column) => ({
              ...column,
              sortable: false,
              flex: props.modeDisplay === ModeDisplay.dashboard ? 0 : 1,
            }))}
            onRowSelected={(row) => setSelectedRow(row)}
            disableColumnMenu
            hideFooterPagination
            hideFooterRowCount
            hideFooterSelectedRowCount
            scrollbarSize={17}
            hideFooter
            components={{
              NoRowsOverlay: props.modeDisplay === ModeDisplay.user ? NotFoundModeDisplay : customNoRowOverlay,
            }}
          />
        </ThemeProvider>
      </div>
      {props.currentScreen === 'balances' && (
        <div
          style={{
            margin: '10px 20px',
            padding: '5px 20px',
            borderRadius: '5px',
            background: 'var(--color-input-bg)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Link
            style={{ color: 'var(--active-tab)', fontSize: 14 }}
            to={ROUTE_SIDEBAR.account_trade_history_open_orders}
          >
            Details
          </Link>
          <img style={{ marginLeft: 4 }} src={theme === THEME_MODE.LIGHT ? detailIconLight : detailIconDark}></img>
        </div>
      )}
      {props.modeDisplay !== ModeDisplay.dashboard && totalPage > 1 && (
        <div className={cx('footer-pagination')}>
          <Pagination
            className={classes.pagination}
            count={totalPage}
            page={conditionFilterOpenOrder.page}
            variant="outlined"
            shape="rounded"
            onChange={handleChangePage}
          />
        </div>
      )}

      {/* Cancel order dialog*/}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        maxWidth={'sm'}
        disableBackdropClick={isCanceling}
        disableEscapeKeyDown={true}
      >
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography component={'div'}>
            <IconButton size={'small'} className={cx('hidden')}>
              <CloseIcon />
            </IconButton>
          </Typography>

          <Typography component={'div'} className={cx('title')}>
            <Box>Cancel order</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton
              onClick={handleCloseCancelDialog}
              size={'small'}
              className={cx('close-button')}
              disabled={isCanceling}
            >
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('cancel-container')}>
          <div className={cx('body')}>
            The remainder of the order will be canceled. <br /> Are you sure?
          </div>
          <div className={cx('btn-group')}>
            <CButton
              size="md"
              type="secondary"
              fullWidth
              onClick={handleCloseCancelDialog}
              isDisabled={isCanceling}
              content="Close"
            />
            <CButton
              size="md"
              type="error"
              fullWidth
              onClick={() => {
                setIsCancelOrder(true);
              }}
              isLoading={isCanceling}
              content="Cancel order"
            />
          </div>
        </div>
      </Dialog>

      {/* Cancel order warning dialog*/}
      <Dialog
        open={openCancelWarningDialog}
        onClose={handleCloseCancelWarningDialog}
        maxWidth={'sm'}
        disableBackdropClick={isCanceling}
      >
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography component={'div'}>
            <IconButton size={'small'} className={cx('hidden')}>
              <CloseIcon />
            </IconButton>
          </Typography>

          <Typography component={'div'} className={cx('title')}>
            <Box>Warning!</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseCancelWarningDialog} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('warning-body')}>
          <div className={cx('warning-icon')}>
            <img src={WarningIcon} alt={'warning icon'} />
          </div>
          <div className={cx('content')}>
            Please connect to the wallet {getShortAddress(selectedRow?.data.address)} to cancel order
          </div>

          <Button
            content={`Connect wallet`}
            type={'primary'}
            size={'md'}
            fullWidth={true}
            onClick={() => {
              handleCloseCancelWarningDialog();
              handleOpenConnectDialog();
            }}
          />
        </div>
      </Dialog>
    </>
  );
};
