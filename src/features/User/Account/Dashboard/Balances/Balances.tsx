import { Pagination } from '@material-ui/lab';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
import { CCheckbox } from 'src/components/Base/Checkbox';
import { CInput } from 'src/components/Base/Input';
import { CSelect } from 'src/components/Base/Select';
import CLoading from 'src/components/Loading';
import stylesPagition from 'src/components/Pagination/style';
import styles from 'src/features/User/Account/Dashboard/Balances/Balances.module.scss';
import { TooltipAddress } from 'src/features/User/Account/Dashboard/components/TooltipAddress';
import TooltipHelp from 'src/features/User/Account/Dashboard/components/TooltipHelp';
import { OverView } from 'src/features/User/Account/Dashboard/OverView';
import {
  getBalancesInPools,
  getWalletStellar,
  PoolsInfoInPool,
  convertValueUSDToCurSelector,
  getRateFromCurrencies,
} from 'src/features/User/Account/Dashboard/OverView/helper';
import {
  BalancesInOrderRes,
  EnumFilterType,
  EnumFilterWallet,
  IListBalancesInfo,
} from 'src/features/User/Account/misc';
import { TITLE_TOOLTIP } from 'src/features/User/Account/misc/constant';
import { renderValueSelect } from 'src/features/User/Account/misc/helper';
import { renderAddressWallet } from 'src/features/User/helpers';
import { currencySelector } from 'src/helpers/functional-currency';
import { getAllBalanceInStellar, getBalanceInBsc } from 'src/helpers/getBalance';
import useOnClickOutside from 'src/hooks/useClickOutside';
import useScrollToTop from 'src/hooks/useScrollToTop';
import { AllCoin } from 'src/interfaces/balance';
import { IResponseService } from 'src/interfaces/response';
import LayoutAccount from 'src/layouts/LayoutAccount/LayoutAccount';
import axiosInstance from 'src/services/config';
import { useAppSelector } from 'src/store/hooks';
import {
  balancesAddressLowerCase,
  DEFAULT_PAGE,
  HIDE_SMALL_BALANCES,
  IBalanceItem,
  IBalancesInfo,
  KeySortBalancesInfo,
  MAX_SIZE_SHOW_ADDRESS,
  OrderBy,
} from './misc';

export const cx = classnames.bind(styles);

const Balances: React.FC = () => {
  const classesPagination = stylesPagition();
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const functionalCurrencies = useAppSelector((state) => state.functionalCurrency.functionalCurrencies.data);
  const walletStore = useAppSelector((state) => state.wallet);
  const allCoins: AllCoin[] = useAppSelector((state) => state.allCoins.coins.data);
  const selectedFunCurrenciesId = useAppSelector((state) => state.auth.currentUser.selectedFunctionalCurrencyId);
  const [balancesAllInfo, setBalancesAllInfo] = useState<IBalancesInfo[]>([]);
  const [balancesAllInfoShow, setBalancesAllInfoShow] = useState<IBalancesInfo[]>([]);
  const poolInfoRef = useRef<PoolsInfoInPool[]>([]);
  const selectedCurrency = useAppSelector(currencySelector);

  const [loading, setLoading] = useState<boolean>(false);
  const [pagingBlsInfo, setPagingBlsInfo] = useState(DEFAULT_PAGE);
  const [keySortBalanesInfo, setKeySortBalancesInfo] = useState<KeySortBalancesInfo>('total');
  const [sortType, setSortBy] = useState<OrderBy>(OrderBy.Asc);
  const maxPageSize = useRef<number>(1);

  const STELLAR_WALLET = useAppSelector(getWalletStellar);
  const BSC_WALLET = walletStore.bsc;
  const WALLET_VALUE = [STELLAR_WALLET, BSC_WALLET].filter((item) => !!item);
  const [filterBalances, setFilterBalances] = useState({
    search: '',
    hideSmall: false,
    wallet: 'all',
  });
  const [showDigitalCredit, setShowDigitalCredit] = useState<string>('');

  // force update balances info table when bsc or stellar wallet change in the store
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);

  const ref = useRef(null);
  useOnClickOutside(ref, () => setShowDigitalCredit(''));
  useScrollToTop();

  useEffect(() => {
    setFilterBalances({
      ...filterBalances,
      wallet: 'all',
    });
    setForceUpdate(!forceUpdate);
  }, [BSC_WALLET, STELLAR_WALLET]);

  // Effect filter balances
  useEffect(() => {
    let isMounted = true;
    if (isMounted && WALLET_VALUE.length > 0) {
      const initBalances: Array<IBalanceItem[]> = [];
      setBalancesAllInfo(() => []);
      let listPool: IBalancesInfo[] = [];
      (async () => {
        setLoading(true);
        try {
          if (!WALLET_VALUE.length) {
            return;
          }

          // In Order
          const resOrder: IResponseService<BalancesInOrderRes[]> = await axiosInstance.get(`/order/balances-in-order`, {
            params: { wallet: filterBalances.wallet === EnumFilterWallet.All ? WALLET_VALUE : filterBalances.wallet },
          });
          if (resOrder.data?.length) {
            const resOrderMap = resOrder.data.map((item) => ({
              ...item,
              type: EnumFilterType.Order,
            }));
            initBalances.push(resOrderMap);
          }

          // Available Stellar => available = balances - selling_liabilities
          if (STELLAR_WALLET && filterBalances.wallet !== BSC_WALLET) {
            const availableStellar = await getAllBalanceInStellar(STELLAR_WALLET);
            const availableStellarMap = availableStellar.map((item) => ({
              value: new BigNumber(item.balance).minus(new BigNumber(item.selling_liabilities)).toNumber(),
              symbol: item.asset_code,
              address: STELLAR_WALLET,
              type: EnumFilterType.Available,
            }));
            initBalances.push(availableStellarMap);
          }

          // Available BSC
          if (BSC_WALLET && filterBalances.wallet !== STELLAR_WALLET) {
            await Promise.all(
              allCoins.map((item: AllCoin) => getBalanceInBsc(BSC_WALLET, item.bsc_address, item.decimal)),
            ).then((values) => {
              const availableBSCMap = values.map((v, i) => ({
                symbol: allCoins[i]?.symbol,
                value: new BigNumber(v).toNumber(),
                address: BSC_WALLET,
                type: EnumFilterType.Available,
              }));
              initBalances.push(availableBSCMap);
            });

            // In Pools only BSC
            const balancesPools = await getBalancesInPools(
              BSC_WALLET,
              allCoins.map((i) => i.symbol),
            );
            const balancesPoolsMap = balancesPools.poolsBalances.map((item) => ({
              ...item,
              address: BSC_WALLET,
              type: EnumFilterType.Pool,
            }));
            initBalances.push(balancesPoolsMap);

            // set pool info merge to balances info
            poolInfoRef.current = balancesPools.poolsInfo;
            listPool = poolInfoRef.current.map((i) => ({
              symbol: i.symbol,
              total: i.myShareBalance,
              available: i.myShareBalance,
              order: 0,
              pool: 0,
              address: [BSC_WALLET],
              urlBsc: i.urlBsc,
              value: new BigNumber(i.myLiquidity).toNumber(),
            }));
          }
        } catch (error) {
          throw error;
        } finally {
          setLoading(false);
          const data: IListBalancesInfo[] = initBalances.flat().map((item) => ({
            ...item,
            amount: item.value,
            address: item.address,
          }));
          const res = data.reduce((arrayTotal: IBalancesInfo[], item: IListBalancesInfo) => {
            const index = arrayTotal.findIndex((v) => v.symbol === item.symbol);
            if (index !== -1) {
              const totalIndex = arrayTotal[index];
              if (item.type === EnumFilterType.Order) {
                totalIndex.order = new BigNumber(totalIndex.order).plus(new BigNumber(item.amount)).toNumber();
              }
              if (item.type === EnumFilterType.Pool || item.type === EnumFilterType.LpToken) {
                totalIndex.pool = new BigNumber(totalIndex.pool).plus(new BigNumber(item.amount)).toNumber();
              }
              if (item.type === EnumFilterType.Available) {
                totalIndex.available = new BigNumber(totalIndex.available).plus(new BigNumber(item.amount)).toNumber();
              }

              arrayTotal.splice(index, 1, {
                ...arrayTotal[index],
                value: new BigNumber(arrayTotal[index]?.value)
                  .plus(
                    new BigNumber(item.amount).div(
                      new BigNumber(getRateFromCurrencies(item.symbol, exchangeRates, functionalCurrencies)),
                    ),
                  )
                  .toNumber(),
                total: new BigNumber(arrayTotal[index]?.total).plus(new BigNumber(item.amount)).toNumber(),
                address: !arrayTotal[index]?.address.includes(item.address)
                  ? arrayTotal[index]?.address.concat(item.address)
                  : arrayTotal[index]?.address,
              });
            } else {
              arrayTotal.push({
                total: new BigNumber(item.amount).toNumber(),
                symbol: item.symbol,
                address: [item.address],
                order: item.type === EnumFilterType.Order ? item.amount : 0,
                available: item.type === EnumFilterType.Available ? item.amount : 0,
                pool: item.type === EnumFilterType.Pool ? item.amount : 0,
                value: new BigNumber(item.amount)
                  .div(new BigNumber(getRateFromCurrencies(item.symbol, exchangeRates, functionalCurrencies)))
                  .toNumber(),
              });
            }
            const rs = arrayTotal.filter((item) => item.total > 0);
            return rs;
          }, []);

          maxPageSize.current = Math.ceil((res.length + poolInfoRef.current.length) / DEFAULT_PAGE.limit);

          const reducePoolIdbyDigital = allCoins.map((coin) => ({
            symbol: coin.symbol,
            poolId: poolInfoRef.current
              .filter((pool) => pool.value.find((i) => i.digitalCredits === coin.symbol))
              .map((i) => i.address),
          }));

          setBalancesAllInfo(
            res
              .map((i) => ({
                ...i,
                address: i.address.concat(reducePoolIdbyDigital.find((dig) => dig.symbol === i.symbol)?.poolId || []),
              }))
              .concat(listPool),
          );
        }
      })();
    }
    return () => {
      isMounted = false;
    };
  }, [filterBalances.wallet, forceUpdate]);

  useEffect(() => {
    setBalancesAllInfoShow(() => []);
    const dataShow = balancesAllInfo.sort((a: IBalancesInfo, b: IBalancesInfo) =>
      sortType === OrderBy.Asc
        ? b[keySortBalanesInfo] - a[keySortBalanesInfo]
        : a[keySortBalanesInfo] - b[keySortBalanesInfo],
    );
    setBalancesAllInfoShow(() =>
      dataShow.map((i) => ({
        ...i,
        value: convertValueUSDToCurSelector(i.value, selectedCurrency, exchangeRates),
      })),
    );

    if (filterBalances.hideSmall) {
      setBalancesAllInfoShow((bls) => bls.filter((item) => item.total > HIDE_SMALL_BALANCES));
    }
    if (filterBalances.search) {
      setBalancesAllInfoShow((bls) =>
        bls.filter((item) =>
          `${item.symbol}${item.urlBsc}`.toLowerCase().includes(filterBalances.search.toLowerCase()),
        ),
      );
    }

    setPagingBlsInfo((pagingBlsInfo) => ({
      ...pagingBlsInfo,
      totalPage: Math.ceil(balancesAllInfoShow.length / DEFAULT_PAGE.limit),
    }));
  }, [
    filterBalances.search,
    filterBalances.hideSmall,
    filterBalances.wallet,
    keySortBalanesInfo,
    sortType,
    selectedFunCurrenciesId,
    balancesAllInfo,
  ]);

  useEffect(() => {
    setPagingBlsInfo({
      ...pagingBlsInfo,
      page: 1,
    });
  }, [filterBalances.wallet, filterBalances.search, filterBalances.hideSmall, BSC_WALLET, STELLAR_WALLET]);

  const renderSortItem = (title: string, key: KeySortBalancesInfo) => {
    return (
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          justifyContent: 'flex-end',
        }}
        onClick={() => {
          setKeySortBalancesInfo(key);
          setSortBy(sortType === OrderBy.Asc ? OrderBy.Desc : OrderBy.Asc);
        }}
      >
        {key === 'order' && <TooltipHelp title={TITLE_TOOLTIP.balaces_order_col} />}
        {title}
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 4,
          }}
        >
          <img
            width={6}
            height={6}
            src={sortType === OrderBy.Desc && keySortBalanesInfo === key ? SortUpHighLightIcon : SortUpIcon}
          />
          <img
            width={6}
            height={6}
            src={sortType === OrderBy.Asc && keySortBalanesInfo === key ? SortDownHighLightIcon : SortDownIcon}
          />
        </span>
      </span>
    );
  };

  const handleChangePage = (event: ChangeEvent<unknown>, value: number) => {
    setPagingBlsInfo({
      ...pagingBlsInfo,
      page: value,
    });
  };

  return (
    <LayoutAccount>
      <OverView screen="balances" />
      <div className={cx('table-info')}>
        <div className={cx('open-order')}>
          <div className={cx('open-order__search')}>
            <div style={{ marginRight: 20 }}>
              <CInput
                isSearch
                size="sm"
                placeholder="Search"
                onKeyPress={(e: string) =>
                  setFilterBalances({
                    ...filterBalances,
                    search: e,
                  })
                }
                onBlur={(e: string) =>
                  setFilterBalances({
                    ...filterBalances,
                    search: e,
                  })
                }
              />
            </div>
            <div className={cx('open-order__search')}>
              <CCheckbox
                size="small"
                content="Hide small balances"
                onClick={() =>
                  setFilterBalances({
                    ...filterBalances,
                    hideSmall: !filterBalances.hideSmall,
                  })
                }
                checked={filterBalances.hideSmall}
              />
              <TooltipHelp title={TITLE_TOOLTIP.hide_small_balance} />
            </div>
          </div>
          <div className={cx('open-order__select')}>
            <label className={cx('label-wallet')}>Wallet: </label>
            <CSelect
              options={[
                { label: 'All', value: EnumFilterWallet.All },
                { label: renderAddressWallet(BSC_WALLET), value: BSC_WALLET },
                {
                  label: renderAddressWallet(STELLAR_WALLET),
                  value: STELLAR_WALLET,
                },
              ].filter((item) => item.value)}
              defaultValue={{ value: EnumFilterWallet.All, label: 'All' }}
              value={renderValueSelect(filterBalances.wallet)}
              onChange={(wallet: string) =>
                setFilterBalances({
                  ...filterBalances,
                  wallet,
                })
              }
            />
          </div>
        </div>
        {/* <FilterBarUser /> */}
        <div className={cx('table')}>
          <table>
            <thead>
              <tr>
                <th>Digital Credit</th>
                <th>{renderSortItem('Total', 'total')}</th>
                <th>{renderSortItem('Available', 'available')}</th>
                <th>{renderSortItem('In order', 'order')}</th>
                <th>{renderSortItem('In pool', 'pool')}</th>
                <th>{renderSortItem(`Value (${selectedCurrency.symbol})`, 'value')}</th>
                <th>Sources</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                balancesAllInfoShow.length > 0 &&
                balancesAllInfoShow
                  ?.slice((pagingBlsInfo.page - 1) * DEFAULT_PAGE.limit, pagingBlsInfo.page * DEFAULT_PAGE.limit)
                  ?.map((balance: IBalancesInfo, index: number) => (
                    <tr className="cursor-pointer" key={index}>
                      <td>
                        {!allCoins.map((i) => i.symbol).includes(balance.symbol) ? (
                          <a
                            className={cx('detail__link', 'symbol-lp-token')}
                            target="_blank"
                            rel="noreferrer"
                            href={`${process.env.REACT_APP_ETHERSCAN || ''}/token/${balance.urlBsc}`}
                          >
                            {balance.symbol}
                          </a>
                        ) : (
                          balance.symbol
                        )}
                      </td>
                      <td className={cx('td-right')}>{new BigNumber(balance.total.toFixed(2)).toFormat()}</td>
                      <td className={cx('td-right')}>
                        {new BigNumber(new BigNumber(balance.available).toFixed(2)).toFormat()}
                      </td>
                      <td className={cx('td-right')}>
                        {new BigNumber(new BigNumber(balance.order).toFixed(2)).toFormat()}
                      </td>
                      <td className={cx('td-right')}>
                        {new BigNumber(new BigNumber(balance.pool).toFixed(2)).toFormat()}
                      </td>
                      <td className={cx('td-right')}>
                        {`${selectedCurrency.symbol}${new BigNumber(
                          new BigNumber(balance.value).toFixed(2),
                        ).toFormat()}`}
                      </td>
                      <td style={{ width: '25%' }}>
                        {filterBalances.wallet === STELLAR_WALLET ? (
                          <TooltipAddress title={STELLAR_WALLET}>
                            <span>{renderAddressWallet(STELLAR_WALLET)}</span>
                          </TooltipAddress>
                        ) : (
                          <span>
                            {balancesAddressLowerCase(balance.address).length > MAX_SIZE_SHOW_ADDRESS ? (
                              <span>
                                {balancesAddressLowerCase(balance.address)
                                  .slice(0, MAX_SIZE_SHOW_ADDRESS)
                                  .map((item, index) =>
                                    WALLET_VALUE.find((v) => v.toLowerCase() === item) ? (
                                      <TooltipAddress
                                        key={item}
                                        title={WALLET_VALUE.find((v) => v.toLowerCase() === item) || item}
                                      >
                                        <span key={item}>{`${renderAddressWallet(
                                          WALLET_VALUE.find((v) => v.toLowerCase() === item) || item,
                                        )}${index < MAX_SIZE_SHOW_ADDRESS - 1 ? ', ' : ''}`}</span>
                                      </TooltipAddress>
                                    ) : (
                                      <TooltipAddress key={item} title={item}>
                                        <Link
                                          className={cx('detail__link', 'symbol-lp-token')}
                                          target="_blank"
                                          rel="noreferrer"
                                          to={`/pools/${item}`}
                                        >
                                          {renderAddressWallet(item)}
                                          {`${index < MAX_SIZE_SHOW_ADDRESS - 1 ? ', ' : ''}`}
                                        </Link>
                                      </TooltipAddress>
                                    ),
                                  )}
                                <span
                                  className={cx('see-more')}
                                  onClick={() => setShowDigitalCredit(balance.symbol)}
                                  style={{ position: 'relative' }}
                                >
                                  See more
                                  {showDigitalCredit && showDigitalCredit === balance.symbol && (
                                    <div ref={ref} className={cx('tooltip-see-more')}>
                                      {balance.address.slice(MAX_SIZE_SHOW_ADDRESS).map((i) => (
                                        <div
                                          style={{
                                            margin: '5px 0',
                                          }}
                                          key={i}
                                        >
                                          <Link
                                            className={cx('detail__link', 'symbol-lp-token')}
                                            target="_blank"
                                            rel="noreferrer"
                                            to={`/pools/${i}`}
                                          >
                                            {i}
                                          </Link>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </span>
                              </span>
                            ) : (
                              <span>
                                {balancesAddressLowerCase(balance.address).map((item, index) =>
                                  WALLET_VALUE.find((v) => v.toLowerCase() === item) ? (
                                    <TooltipAddress
                                      key={item}
                                      title={WALLET_VALUE.find((v) => v.toLowerCase() === item) || item}
                                    >
                                      <span key={item}>{`${renderAddressWallet(
                                        WALLET_VALUE.find((v) => v.toLowerCase() === item) || item,
                                      )}${
                                        index < MAX_SIZE_SHOW_ADDRESS - 1 && index < balance.address.length - 1
                                          ? ', '
                                          : ''
                                      }`}</span>
                                    </TooltipAddress>
                                  ) : (
                                    <TooltipAddress key={item} title={item}>
                                      <Link
                                        className={cx('detail__link', 'symbol-lp-token')}
                                        target="_blank"
                                        rel="noreferrer"
                                        to={`/pools/${item}`}
                                      >
                                        {renderAddressWallet(item)}
                                        {`${
                                          index < MAX_SIZE_SHOW_ADDRESS - 1 && index !== balance.address.length - 1
                                            ? ', '
                                            : ''
                                        }`}
                                      </Link>
                                    </TooltipAddress>
                                  ),
                                )}
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {loading && (
            <div className={cx('table-no-data')}>
              <CLoading type="text" size="lg" />
            </div>
          )}
          {!loading && !filterBalances.search && !balancesAllInfo.length && (
            <div className={cx('table-no-data')}>No record</div>
          )}
          {!loading && filterBalances.search && !balancesAllInfoShow.length && (
            <div className={cx('table-no-data')}>Not found</div>
          )}
          {Math.ceil(balancesAllInfoShow.length / DEFAULT_PAGE.limit) > 1 && (
            <div className={cx('footer-pagination')}>
              <Pagination
                className={classesPagination.pagination}
                count={Math.ceil(balancesAllInfoShow.length / DEFAULT_PAGE.limit)}
                page={pagingBlsInfo.page}
                variant="outlined"
                shape="rounded"
                onChange={handleChangePage}
              />
            </div>
          )}
        </div>
      </div>
    </LayoutAccount>
  );
};

export default Balances;
