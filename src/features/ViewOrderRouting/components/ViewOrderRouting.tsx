/* eslint-disable max-len */
import { Box, Divider, Link } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';
import ArrowDownOutline from 'src/assets/icon/ArrowDownOutline';
import ArrowRightOutline from 'src/assets/icon/ArrowRightOutline';
import BscSVG from 'src/assets/icon/BscSVG';
import { ReactComponent as InfoSquareLight } from 'src/assets/icon/Info-square-light.svg';
import FCXPoolIcon from 'src/assets/icon/pool/FCXPoolIcon';
import PancakeswapPoolIcon from 'src/assets/icon/pool/PancakeswapPoolIcon';
import { ReactComponent as IconSortDown } from 'src/assets/icon/sort/icon-sort-down.svg';
import { ReactComponent as IconSortUp } from 'src/assets/icon/sort/icon-sort-up.svg';
import StellarSVG from 'src/assets/icon/StellarSVG';
import CLoading from 'src/components/Loading';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { formatPoolPercent } from 'src/features/PoolsInfo/helpers/dataFormatter';
import { Source } from 'src/features/SOR/constances/source';
import styles from 'src/features/ViewOrderRouting/styles/ViewOrderRouting.module.scss';
import { TokenIcon } from 'src/pages/PoolsList/helpers/TokenIcon';
import { getTokensList, getTokensList2 } from 'src/services/pool';
import { useAppSelector } from 'src/store/hooks';

const cx = classnames.bind(styles);

interface IObject {
  [key: string]: any;
}

interface Props {
  data?: { [key: string]: any };
}

const ViewOrderRouting: React.FC<Props> = ({ data }) => {
  const [open, setOpen] = useState<boolean>(false);
  const sorData = useAppSelector((state) => state.sor);
  const coins = useAppSelector((state) => state.allCoins.coins.data);
  const [buyToken, setBuyToken] = useState<IObject>();
  const [sellToken, setSellToken] = useState<IObject>();
  const [total, setTotal] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const [seeMore, setSeeMore] = useState<boolean>(true);
  const [poolsList, setPoolsList] = useState<Array<IObject>>([]);
  const isLoading = useAppSelector((state) => state.sor.isLoadingSORData);
  // const [isRenderToken, setIsRenderToken] = useState<boolean>(false);
  const sor = useAppSelector((state) => state.sor);

  const tokensList = coins.map((item: IObject) => {
    return { address: item.bsc_address, symbol: item.symbol };
  });

  // const getPercentage = (data: any, source: Source): string => {
  //   if (source === Source.BscLPSource) {
  //     const sourceData = data?.sources?.find((item: any) => item.name === Source.BscLPSource);
  //     return sourceData ? sourceData.proportion : '1';
  //   } else if (source === Source.PancakeswapLPSource) {
  //     const sourceData = data?.sources?.find((item: any) => item.name === Source.PancakeswapLPSource);
  //     return sourceData ? sourceData.proportion : '1';
  //   } else if (source === Source.BscLPSourceMultiHop) {
  //     const sourceData = data?.sources?.find((item: any) => item.name === Source.BscLPSourceMultiHop);
  //     return sourceData ? sourceData.proportion : '1';
  //   } else {
  //     return '1';
  //   }
  // };

  const calcPercentage = (amount: string) => {
    if (total) return new BigNumber(amount).div(total).toString();
  };

  const goToPool = (event: React.MouseEvent<HTMLElement, MouseEvent>, poolAddress: string) => {
    const url = `/pools/${poolAddress}`;
    window.open(url, '_blank')?.focus();
  };

  const checkSourceMultiHop = (sources: any[]) => {
    return !!sources?.find((i: any) => i.name === Source.BscLPSourceMultiHop && Number(i.proportion));
  };

  useEffect(() => {
    (async () => {
      try {
        if (data && !checkSourceMultiHop(data.sources)) {
          const buy = tokensList.find(
            (item: IObject) => item.address?.toLowerCase() === data.buyTokenAddress?.toLowerCase(),
          );
          const sell = tokensList.find(
            (item: IObject) => item.address?.toLowerCase() === data.sellTokenAddress?.toLowerCase(),
          );
          setBuyToken(buy);
          setSellToken(sell);

          const pools: Array<IObject> = [];
          const poolCount = data.orders?.reduce((total: number, item: IObject) => {
            if (item.source === Source.BscLPSource || item.source === Source.PancakeswapLPSource) {
              pools.push(item);
              return ++total;
            }
          }, 0);

          // getTokensList(pools.map((item) => `"${item.fillData.poolAddress}"`)).then((res) => {
          //   pools.forEach((item, key) => {
          //     const pool = res.find((x: IObject) => x.id === item.fillData.poolAddress);
          //     pools[key].tokens = pool?.tokens || [];
          //   });
          // });
          await getTokensList(pools.map((item) => `"${item.fillData.poolAddress}"`)).then((res) => {
            for (const i in pools) {
              const pool = res.find((x: IObject) => x.id === pools[i].fillData.poolAddress);
              pools[i].tokens = pool?.tokens || [];
            }
          });

          // pools.forEach((item, key) => {
          //   if (item.source === Source.PancakeswapLPSource) {
          //     getTokensList2(item.fillData.tokenAddressPath).then((res) => {
          //       pools[key].tokens = res || [];
          //     });
          //   }
          // });
          for (const i in pools) {
            if (pools[i].source === Source.PancakeswapLPSource) {
              const res = await getTokensList2(pools[i].fillData.tokenAddressPath);
              pools[i].tokens = res || [];
            }
          }

          setPoolsList(pools);
          setSeeMore(poolCount >= 2);
          setTotal(data.behaviour == Behaviour.BUY ? data?.buyAmount : data?.sellAmount);
        }
        if (data && checkSourceMultiHop(data.sources)) {
          const buy = tokensList.find(
            (item: IObject) => item.address?.toLowerCase() === data.buyTokenAddress?.toLowerCase(),
          );
          const sell = tokensList.find(
            (item: IObject) => item.address?.toLowerCase() === data.sellTokenAddress?.toLowerCase(),
          );
          setBuyToken(buy);
          setSellToken(sell);

          const pools = data.orders.filter(
            (i: any) => i.source === Source.BscLPSource || i.source === Source.PancakeswapLPSource,
          );

          // getTokensList(pools.map((item: any) => `"${item.fillData.poolAddress}"`)).then((res) => {
          //   pools.forEach((item: any, key: number) => {
          //     const pool = res.find((x: IObject) => x.id === item.fillData.poolAddress);
          //     pools[key].tokens = pool?.tokens || [];
          //   });
          // });
          await getTokensList(pools.map((item: any) => `"${item.fillData.poolAddress}"`)).then((res) => {
            for (const i in pools) {
              const pool = res.find((x: IObject) => x.id === pools[i].fillData.poolAddress);
              pools[i].tokens = pool?.tokens || [];
            }
          });

          // pools.forEach((item: any, key: any) => {
          //   if (item.source === Source.PancakeswapLPSource) {
          //     getTokensList2(item.fillData.tokenAddressPath).then((res) => {
          //       pools[key].tokens = res || [];
          //     });
          //   }
          // });
          for (const i in pools) {
            if (pools[i].source === Source.PancakeswapLPSource) {
              const res = await getTokensList2(pools[i].fillData.tokenAddressPath);
              pools[i].tokens = res || [];
            }
          }

          setPoolsList(pools);
        }
      } catch (e) {}
    })();
  }, [data]);
  const toggle = () => {
    setOpen(!open);
  };

  const renderPoolTokenIcon = (
    type: 'first' | 'last' | 'normal',
    tokenList: { [key: string]: any }[],
    token: string,
  ) => {
    if (type === 'first') {
      const newListTokens = tokenList
        .filter((i) => i.symbol === token)
        .concat(tokenList.filter((i) => i.symbol !== token));
      return newListTokens?.map((token: IObject, key: number) => <TokenIcon name={token.symbol} size={20} key={key} />);
    }
    if (type === 'last') {
      const newListTokens = tokenList
        .filter((i) => i.symbol !== token)
        .concat(tokenList.filter((i) => i.symbol === token));
      return newListTokens?.map((token: IObject, key: number) => <TokenIcon name={token.symbol} size={20} key={key} />);
    }
    if (type === 'normal') {
      const newListTokens = tokenList
        .filter((i) => i.symbol === sellToken?.symbol)
        .concat(tokenList.filter((i) => i.symbol !== buyToken?.symbol && i.symbol !== sellToken?.symbol))
        .concat(tokenList.filter((i) => i.symbol === buyToken?.symbol));
      return newListTokens?.map((token: IObject, key: number) => <TokenIcon name={token.symbol} size={20} key={key} />);
    }
    return tokenList?.map((token: IObject, key: number) => <TokenIcon name={token.symbol} size={20} key={key} />);
  };

  const getIconOfPool = (source: Source) => {
    if (source === Source.BscLPSource) {
      return (
        <div className={cx('order__pool-icon')}>
          <FCXPoolIcon />
        </div>
      );
    } else if (source === Source.PancakeswapLPSource) {
      return (
        <div className={cx('order__pool-icon')}>
          <PancakeswapPoolIcon />
        </div>
      );
    }
  };

  // useEffect(() => {
  //   resetRenderTimout();
  // }, [poolsList]);

  return (
    <>
      <div className={cx('container')}>
        <div className={cx('header')} onClick={toggle}>
          <div className={cx('name')}>View order routing</div>
          {open ? <ArrowDownOutline size={'lg'} /> : <ArrowRightOutline size={'lg'} />}
        </div>
        {open && (
          <div className={cx('body')}>
            {isLoading ? (
              <div className={cx('loading')}>
                <CLoading type={'text'} size={'sm'} />
              </div>
            ) : !new BigNumber(sorData.price).gt(0) ? (
              <div className={cx('not-available')}>The order routing is not available</div>
            ) : (
              <>
                {new BigNumber(sorData.bscOB.proportion).plus(sorData.stellarOB.proportion).gt(0) && (
                  <div className={cx('order-book')}>
                    <div className={cx('label')}>Order Book</div>
                    <div className={cx('order-book-body')}>
                      {new BigNumber(sorData.bscOB.proportion).gt(0) && (
                        <div className={cx('bscOB')}>
                          <BscSVG size={'lg'} />
                          <div>{new BigNumber(sorData.bscOB.proportion).times(100).dp(2).toString()}%</div>
                        </div>
                      )}
                      {new BigNumber(sorData.stellarOB.proportion).gt(0) && (
                        <div className={cx('stellarOB')}>
                          <StellarSVG size={'lg'} />
                          <div>{new BigNumber(sorData.stellarOB.proportion).times(100).dp(2).toString()}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {(new BigNumber(sorData.bscLP.proportion).gt(0) ||
                  new BigNumber(sorData.pancakeswapLP.proportion).gt(0)) &&
                  data &&
                  !(sor.bscLP.source === Source.BscLPSourceMultiHop) && (
                    <div className={cx('liquidity-pools')}>
                      <div ref={ref}>
                        {sellToken && buyToken && (
                          <>
                            <div className={cx('label')}>Liquidity Pools</div>
                            <div className={cx('main')}>
                              <TokenIcon name={sellToken?.symbol} size={50} />
                              <div className={cx('from-to')}>
                                <Box display="flex" justifyContent="space-between">
                                  <span className={cx('name')}>{sellToken?.symbol}</span>
                                  <span className={cx('name')}>{buyToken?.symbol}</span>
                                </Box>
                                <Divider />
                                <span>&#8203;</span>
                              </div>
                              <TokenIcon name={buyToken?.symbol} size={50} />
                            </div>
                            <Box display="flex" justifyContent="space-between" className={cx('icon-arrow-wrapper')}>
                              <Box display="flex" justifyContent="center" style={{ width: '50px' }}>
                                <IconSortDown className={cx('icon-arrow')} />
                              </Box>
                              <Box display="flex" justifyContent="center" style={{ width: '50px' }}>
                                <IconSortUp className={cx('icon-arrow')} />
                              </Box>
                            </Box>
                            <div className={cx('orders')}>
                              {!checkSourceMultiHop(data.sources) &&
                                poolsList.map((item: IObject, key: number) => {
                                  if (key < (seeMore ? 2 : poolsList.length) && item.source === Source.BscLPSource) {
                                    return (
                                      <div className={cx('order')} key={key}>
                                        <div
                                          className={cx('order__pool-wrapper')}
                                          onClick={(event) => goToPool(event, item.fillData.poolAddress)}
                                        >
                                          {getIconOfPool(item.source)}
                                          <Box display="flex">
                                            <Box
                                              display="flex"
                                              height="100%"
                                              width="100%"
                                              justifyContent="center"
                                              className={cx('order__pool')}
                                            >
                                              <Box display="flex" alignItems="center">
                                                {!!item?.tokens?.length &&
                                                  renderPoolTokenIcon('normal', item?.tokens, '')}
                                              </Box>
                                            </Box>
                                          </Box>
                                        </div>
                                        <div className={cx('order__percentage')}>
                                          {/*{getPercentage(data, Source.BscLPSource)}*/}
                                          {/*{'%'}*/}
                                          {`${formatPoolPercent(
                                            calcPercentage(
                                              data.behaviour == Behaviour.BUY ? item.makerAmount : item.takerAmount,
                                            ) || '',
                                          )}%`}
                                        </div>
                                      </div>
                                    );
                                  }
                                })}
                              {!checkSourceMultiHop(data.sources) &&
                                poolsList.map((item: IObject, key: number) => {
                                  if (
                                    key < (seeMore ? 2 : poolsList.length) &&
                                    item.source === Source.PancakeswapLPSource
                                  ) {
                                    return (
                                      <div className={cx('order')} key={key}>
                                        <div
                                          className={cx('order__pool-wrapper')}
                                          // onClick={(event) => goToPool(event, item.fillData.router)}
                                        >
                                          {getIconOfPool(item.source)}
                                          <Box display="flex">
                                            <Box
                                              display="flex"
                                              height="100%"
                                              width="100%"
                                              justifyContent="center"
                                              className={cx('order__pool')}
                                            >
                                              <Box display="flex" alignItems="center">
                                                {!!item?.tokens?.length &&
                                                  renderPoolTokenIcon('normal', item?.tokens, '')}
                                              </Box>
                                            </Box>
                                          </Box>
                                        </div>
                                        <div className={cx('order__percentage')}>
                                          {/*{getPercentage(data, Source.PancakeswapLPSource)}*/}
                                          {/*{'%'}*/}
                                          {`${formatPoolPercent(
                                            calcPercentage(
                                              data.behaviour == Behaviour.BUY ? item.makerAmount : item.takerAmount,
                                            ) || '',
                                          )}%`}
                                        </div>
                                      </div>
                                    );
                                  }
                                })}
                            </div>
                            {poolsList.length > 2 && seeMore && (
                              <Box display="flex" justifyContent="flex-end" width="100%">
                                <Link
                                  href="#"
                                  color="inherit"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSeeMore(!poolsList.length);
                                  }}
                                >
                                  <Box display="flex" alignItems="center">
                                    <span>See more&nbsp;</span>
                                    <InfoSquareLight />
                                  </Box>
                                </Link>
                              </Box>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                {/*{new BigNumber(sorData.pancakeswapLP.proportion).gt(0) && data && (*/}
                {/*  <div className={cx('liquidity-pools')}>*/}
                {/*    <div ref={ref}>*/}
                {/*      {sellToken && buyToken && (*/}
                {/*        <>*/}
                {/*          <div className={cx('label')}>Liquidity Pools</div>*/}
                {/*          <div className={cx('main')}>*/}
                {/*            <TokenIcon name={sellToken?.symbol} size={50} />*/}
                {/*            <div className={cx('from-to')}>*/}
                {/*              <Box display="flex" justifyContent="space-between">*/}
                {/*                <span className={cx('name')}>{sellToken?.symbol}</span>*/}
                {/*                <span className={cx('name')}>{buyToken?.symbol}</span>*/}
                {/*              </Box>*/}
                {/*              <Divider />*/}
                {/*              <span>&#8203;</span>*/}
                {/*            </div>*/}
                {/*            <TokenIcon name={buyToken?.symbol} size={50} />*/}
                {/*          </div>*/}
                {/*          <Box display="flex" justifyContent="space-between" className={cx('icon-arrow-wrapper')}>*/}
                {/*            <Box display="flex" justifyContent="center" style={{ width: '50px' }}>*/}
                {/*              <IconSortDown className={cx('icon-arrow')} />*/}
                {/*            </Box>*/}
                {/*            <Box display="flex" justifyContent="center" style={{ width: '50px' }}>*/}
                {/*              <IconSortUp className={cx('icon-arrow')} />*/}
                {/*            </Box>*/}
                {/*          </Box>*/}
                {/*          <div className={cx('orders')}>*/}
                {/*            {!checkSourceMultiHop(data.sources) &&*/}
                {/*              poolsList.map((item: IObject, key: number) => {*/}
                {/*                if (*/}
                {/*                  key < (seeMore ? 2 : poolsList.length) &&*/}
                {/*                  item.source === Source.PancakeswapLPSource*/}
                {/*                ) {*/}
                {/*                  return (*/}
                {/*                    <div className={cx('order')} key={key}>*/}
                {/*                      <div*/}
                {/*                        className={cx('order__pool-wrapper')}*/}
                {/*                        // onClick={(event) => goToPool(event, item.fillData.router)}*/}
                {/*                      >*/}
                {/*                        {getIconOfPool(item.source)}*/}
                {/*                        <Box display="flex">*/}
                {/*                          <Box*/}
                {/*                            display="flex"*/}
                {/*                            height="100%"*/}
                {/*                            width="100%"*/}
                {/*                            justifyContent="center"*/}
                {/*                            className={cx('order__pool')}*/}
                {/*                          >*/}
                {/*                            <Box display="flex" alignItems="center">*/}
                {/*                              {!!item?.tokens?.length &&*/}
                {/*                                renderPoolTokenIcon('normal', item?.tokens, '')}*/}
                {/*                            </Box>*/}
                {/*                          </Box>*/}
                {/*                        </Box>*/}
                {/*                      </div>*/}
                {/*                      <div className={cx('order__percentage')}>*/}
                {/*                        /!*{getPercentage(data, Source.PancakeswapLPSource)}*!/*/}
                {/*                        /!*{'%'}*!/*/}
                {/*                        {`${formatPoolPercent(*/}
                {/*                          calcPercentage(*/}
                {/*                            data.behaviour == Behaviour.BUY ? item.makerAmount : item.takerAmount,*/}
                {/*                          ) || '',*/}
                {/*                        )}%`}*/}
                {/*                      </div>*/}
                {/*                    </div>*/}
                {/*                  );*/}
                {/*                }*/}
                {/*              })}*/}
                {/*          </div>*/}
                {/*          {poolsList.length > 2 && seeMore && (*/}
                {/*            <Box display="flex" justifyContent="flex-end" width="100%">*/}
                {/*              <Link*/}
                {/*                href="#"*/}
                {/*                color="inherit"*/}
                {/*                onClick={(e) => {*/}
                {/*                  e.preventDefault();*/}
                {/*                  setSeeMore(!poolsList.length);*/}
                {/*                }}*/}
                {/*              >*/}
                {/*                <Box display="flex" alignItems="center">*/}
                {/*                  <span>See more&nbsp;</span>*/}
                {/*                  <InfoSquareLight />*/}
                {/*                </Box>*/}
                {/*              </Link>*/}
                {/*            </Box>*/}
                {/*          )}*/}
                {/*        </>*/}
                {/*      )}*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*)}*/}
                {data && checkSourceMultiHop(data?.sources) && sor.bscLP.source === Source.BscLPSourceMultiHop && (
                  <div className={cx('liquidity-pools')}>
                    <div ref={ref}>
                      {sellToken && buyToken && (
                        <>
                          <div className={cx('label')}>Liquidity Pools</div>
                          <div className={cx('main')}>
                            <TokenIcon name={sellToken?.symbol} size={50} />
                            <div className={cx('from-to')}>
                              <Box display="flex" justifyContent="space-between">
                                <span className={cx('name')}>{sellToken?.symbol}</span>
                                <span className={cx('name')}>{buyToken?.symbol}</span>
                              </Box>
                              <Divider />
                              <span>&#8203;</span>
                            </div>
                            <TokenIcon name={buyToken?.symbol} size={50} />
                          </div>
                          <Box display="flex" justifyContent="space-between" className={cx('icon-arrow-wrapper')}>
                            <Box display="flex" justifyContent="center" style={{ width: '50px' }}>
                              <IconSortDown className={cx('icon-arrow')} />
                            </Box>
                            <Box display="flex" justifyContent="center" style={{ width: '50px' }}>
                              <IconSortUp className={cx('icon-arrow')} />
                            </Box>
                          </Box>
                          <div className={cx('orders')}>
                            {data && checkSourceMultiHop(data.sources) && (
                              <div className={cx('order')}>
                                <div className={cx('order__pool-wrapper')}>
                                  <Box display="flex">
                                    {data.orders.map((order: any, key: number) => (
                                      <Box
                                        display="flex"
                                        height="100%"
                                        width="100%"
                                        justifyContent="center"
                                        className={cx('order__pool')}
                                        key={key}
                                        onClick={() => {
                                          // eslint-disable-next-line max-len
                                          // const url = `/pools/${order?.fillData?.poolAddress || order?.fillData?.router}`;
                                          const url = `/pools/${order?.fillData?.poolAddress}`;
                                          if (order.fillData.poolAddress) {
                                            window.open(url, '_blank')?.focus();
                                          }
                                        }}
                                      >
                                        {getIconOfPool(order.source)}
                                        <Box
                                          display="flex"
                                          justifyContent="center"
                                          alignItems="center"
                                          style={{
                                            minWidth: `${26 * (order.tokens?.length || 1)}px`,
                                            padding: '2px 0',
                                          }}
                                        >
                                          <div style={{ display: 'flex' }}>
                                            {!!order?.tokens?.length &&
                                              // order.tokens?.map((token: IObject, key: number) => {
                                              //   return <TokenIcon name={token.symbol} size={20} key={key} />;
                                              // })
                                              renderPoolTokenIcon(
                                                key === 0 ? 'first' : 'last',
                                                order?.tokens,
                                                key === 0 ? sellToken?.symbol : buyToken?.symbol,
                                              )}
                                          </div>
                                          {/* {order.tokens?.length < 3 ? (
                                            <div>
                                              {order.tokens?.map((token: IObject, key: number) => {
                                                return <TokenIcon name={token.symbol} size={26} key={key} />;
                                              })}
                                            </div>
                                          ) : (
                                            <div>
                                              {order.tokens?.slice(0, 1)?.map((token: IObject, key: number) => {
                                                return <TokenIcon name={token.symbol} size={26} key={key} />;
                                              })}
                                              <span>{` ... `}</span>
                                              {order.tokens?.slice(-1)?.map((item: IObject, key: number) => {
                                                return <TokenIcon name={item.symbol} size={26} key={key} />;
                                              })}
                                            </div>
                                          )} */}
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </div>
                                <div className={cx('order__percentage')}>{`${formatPoolPercent(
                                  `${
                                    data?.sources?.find(
                                      (i: any) => i.name === Source.BscLPSourceMultiHop && Number(i.proportion),
                                    )?.proportion
                                  }` || '0',
                                )}%`}</div>
                              </div>
                            )}
                          </div>
                          {poolsList.length > 2 && seeMore && (
                            <Box display="flex" justifyContent="flex-end" width="100%">
                              <Link
                                href="#"
                                color="inherit"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSeeMore(!poolsList.length);
                                }}
                              >
                                <Box display="flex" alignItems="center">
                                  <span>See more&nbsp;</span>
                                  <InfoSquareLight />
                                </Box>
                              </Link>
                            </Box>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewOrderRouting;
