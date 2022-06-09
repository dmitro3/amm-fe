/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useAppSelector } from 'src/store/hooks';
import styles from './PairModal.module.scss';
import classnames from 'classnames/bind';
import { Popover, Button, Typography } from '@material-ui/core';
import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';
import searchIcon from 'src/assets/icon/search.svg';
import { Pair, PairFullInfo, PairInfo } from 'src/features/Pairs/interfaces/pair';
import { useEffect } from 'react';
import Dropdown from 'src/components/Dropdown';
import { getPairFullInfo } from 'src/helpers/pair';
import { fixPrecision } from 'src/helpers/fixPrecision';
import { displayData } from '../../helper';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
import { TradingMethod } from 'src/constants/dashboard';
import { getClassNamePrice, TO_FIX_2 } from 'src/features/Pairs/components/Pairs';

enum SORT {
  NONE,
  INCREASE,
  DECREASE,
}

enum DisplayMode {
  PriceChange,
  Volume,
}

const cx = classnames.bind(styles);

interface PairModalProps {
  open: boolean;
  refElm: HTMLButtonElement | null;
  handleClose: any;
  pairs: Array<Pair>;
  pairInfos: Array<PairInfo>;
  onSelectPairId: (pairId: number) => void;
  network: TradingMethod;
}
const PairModal: React.FC<PairModalProps> = ({
  pairs,
  open,
  handleClose,
  refElm,
  pairInfos,
  onSelectPairId,
  network,
}) => {
  const [pairStatistic, setPairStatistic] = useState<HTMLButtonElement | null>(null);
  const [sortingPrice, setSortingPrice] = useState(SORT.NONE);
  const [sortingPriceChange, setSortingPriceChange] = useState(SORT.NONE);
  const [sortingVolume, setSortingVolume] = useState(SORT.NONE);
  const [displayPairs, setDispayPairs] = useState<Array<PairFullInfo>>([]);
  const [keywordSearch, setKeywordSearch] = useState<string>('');
  const [pairFullInfos, setPairFullInfos] = useState<Array<PairFullInfo>>([]);
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const [displayMode, setDisplayMode] = useState<number>(DisplayMode.PriceChange);

  const handleFilterPairsDisplay = (
    pairFullInfos: PairFullInfo[],
    keywordSearch?: string | undefined,
    sortingPriceChange?: number,
    sortingPrice?: number,
    sortingVolume?: number,
  ) => {
    let pairsDisplay: PairFullInfo[] = pairFullInfos.sort((a, b) => a.name.localeCompare(b.name));
    if (keywordSearch !== undefined) {
      pairsDisplay = pairsDisplay.filter((pair: PairFullInfo) =>
        pair.name.toLowerCase().includes(keywordSearch.toLowerCase()),
      );
    }

    if (sortingPrice !== SORT.NONE) {
      pairsDisplay = pairsDisplay.sort((a, b) =>
        sortingPrice === SORT.INCREASE ? a.last_price - b.last_price : b.last_price - a.last_price,
      );
    }

    if (sortingPriceChange !== SORT.NONE) {
      if (network !== TradingMethod.BSCPool) {
        pairsDisplay = pairsDisplay.sort((a, b) =>
          sortingPriceChange === SORT.INCREASE
            ? a.price_change_percent - b.price_change_percent
            : b.price_change_percent - a.price_change_percent,
        );
      } else {
        pairsDisplay = pairsDisplay.sort((a, b) =>
          sortingPriceChange === SORT.INCREASE
            ? a.liquidity_change_percent - b.liquidity_change_percent
            : b.liquidity_change_percent - a.liquidity_change_percent,
        );
      }
    }
    if (sortingVolume !== SORT.NONE) {
      pairsDisplay = pairsDisplay.sort((a, b) =>
        sortingVolume === SORT.INCREASE ? a.volume - b.volume : b.volume - a.volume,
      );
    }

    setDispayPairs(pairsDisplay);
  };

  const resetSortState = () => {
    setKeywordSearch('');
    setSortingVolume(SORT.NONE);
    setSortingPrice(SORT.NONE);
    setSortingPriceChange(SORT.NONE);
  };

  const handleClosePopover = () => {
    handleClose();
    setTimeout(resetSortState, 200);
  };

  useEffect(() => {
    if (!!pairs?.length) {
      const cookedData = getPairFullInfo(pairs, pairInfos, network);
      setPairFullInfos(cookedData);
      handleFilterPairsDisplay(cookedData, keywordSearch, sortingPriceChange, sortingPrice, sortingVolume);
    }
  }, [pairs, pairInfos, selectedMethods]);

  useEffect(() => {
    handleFilterPairsDisplay(pairFullInfos, keywordSearch, sortingPriceChange, sortingPrice, SORT.NONE);
  }, [keywordSearch]);

  const handleChangeSortMode = (currentSortMode: number) => {
    switch (currentSortMode) {
      case SORT.NONE:
        return SORT.INCREASE;
      case SORT.INCREASE:
        return SORT.DECREASE;
      case SORT.DECREASE:
        return SORT.NONE;
      default:
        return SORT.NONE;
    }
  };

  const getIconSort = (sortType: SORT) => {
    const res = { up: SortUpIcon, down: SortDownIcon };
    if (sortType === SORT.INCREASE) {
      res.up = SortUpHighLightIcon;
    } else if (sortType === SORT.DECREASE) {
      res.down = SortDownHighLightIcon;
    }
    return res;
  };

  return (
    <>
      {open && (
        <Popover
          open={open}
          anchorEl={refElm}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          classes={{ paper: cx('modal-paper') }}
        >
          <div className={cx('content-wrapper')}>
            <div className={cx('change-btn-wrapper')}>
              <Button
                endIcon={<ArrowDropDownRoundedIcon className={cx('arrow-icon')} />}
                className={cx('change-btn')}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => setPairStatistic(event.currentTarget)}
              >
                <Typography className={cx('change-label')}>
                  {displayMode === DisplayMode.PriceChange ? 'Change' : 'Volume'}
                </Typography>
              </Button>
            </div>
            <div className={cx('search-wrapper')}>
              <input
                className={cx('input-search')}
                type="text"
                placeholder="Search"
                value={keywordSearch}
                onChange={(event) => setKeywordSearch(event.target.value.trim())}
              />
              <div className={cx('search-icon')}>
                <img src={searchIcon} />
              </div>
            </div>

            <div className={cx('pairs')}>
              <div className={cx('header')}>
                <div className={cx('column-name', 'pair-column')}>Pair</div>
                <div
                  className={cx('column-name', 'price-column')}
                  onClick={() => {
                    handleFilterPairsDisplay(
                      pairFullInfos,
                      keywordSearch,
                      SORT.NONE,
                      handleChangeSortMode(sortingPrice),
                      SORT.NONE,
                    );
                    setSortingPrice(handleChangeSortMode(sortingPrice));
                    setSortingPriceChange(SORT.NONE);
                    setSortingVolume(SORT.NONE);
                  }}
                >
                  <div className={cx('label')}>Price</div>
                  <div className={cx('sort')}>
                    <img src={getIconSort(sortingPrice).up} />
                    <img src={getIconSort(sortingPrice).down} />
                  </div>
                </div>
                {displayMode === DisplayMode.PriceChange && (
                  <div
                    className={cx('column-name', 'text-right', 'change-column')}
                    onClick={() => {
                      handleFilterPairsDisplay(
                        pairFullInfos,
                        keywordSearch,
                        handleChangeSortMode(sortingPriceChange),
                        SORT.NONE,
                        SORT.NONE,
                      );
                      setSortingPriceChange(handleChangeSortMode(sortingPriceChange));
                      setSortingPrice(SORT.NONE);
                      setSortingVolume(SORT.NONE);
                    }}
                  >
                    <div className={cx('label')}>Change</div>
                    <div className={cx('sort')}>
                      <img src={getIconSort(sortingPriceChange).up} />
                      <img src={getIconSort(sortingPriceChange).down} />
                    </div>
                  </div>
                )}
                {displayMode === DisplayMode.Volume && (
                  <div
                    className={cx('column-name', 'text-right', 'change-column')}
                    onClick={() => {
                      handleFilterPairsDisplay(
                        pairFullInfos,
                        keywordSearch,
                        SORT.NONE,
                        SORT.NONE,
                        handleChangeSortMode(sortingVolume),
                      );
                      setSortingVolume(handleChangeSortMode(sortingVolume));
                      setSortingPriceChange(SORT.NONE);
                      setSortingPrice(SORT.NONE);
                    }}
                  >
                    <div className={cx('label')}>Volume</div>
                    <div className={cx('sort')}>
                      <img src={getIconSort(sortingVolume).up} />
                      <img src={getIconSort(sortingVolume).down} />
                    </div>
                  </div>
                )}
              </div>
              <div className={cx('body-pair-modal')}>
                {displayPairs.length === 0 ? (
                  <div className={cx('not-found')}>The pair you are searching for is not available.</div>
                ) : (
                  displayPairs.map((pair: PairFullInfo) => (
                    <div
                      className={cx('row')}
                      key={pair.pair_id}
                      onClick={() => {
                        onSelectPairId(pair.pair_id);
                        handleClosePopover();
                      }}
                    >
                      <div className={cx('data', 'pair-column')}>{pair.name}</div>
                      <div className={cx('price', 'price-column')}>
                        {displayData(pair?.last_price, pair?.price_precision)}
                      </div>
                      {displayMode === DisplayMode.PriceChange && (
                        <>
                          {network !== TradingMethod.BSCPool ? (
                            <div
                              className={cx(
                                'price',
                                'text-right',
                                'change-column',
                                getClassNamePrice(pair?.price_change_percent),
                              )}
                            >
                              {pair?.price_change_percent
                                ? `${fixPrecision(pair?.price_change_percent, TO_FIX_2)}%`
                                : '-'}
                            </div>
                          ) : (
                            <div
                              className={cx(
                                'price',
                                'text-right',
                                'change-column',
                                getClassNamePrice(pair?.liquidity_change_percent),
                              )}
                            >
                              {pair?.liquidity_change_percent
                                ? `${fixPrecision(pair?.liquidity_change_percent, TO_FIX_2)}%`
                                : '-'}
                            </div>
                          )}
                        </>
                      )}
                      {displayMode === DisplayMode.Volume && (
                        <div className={cx('price', 'text-right', 'change-column')}>
                          {pair?.volume ? `${fixPrecision(pair?.volume, TO_FIX_2)}` : '-'}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Popover>
      )}
      <Dropdown
        open={Boolean(pairStatistic)}
        refElm={pairStatistic}
        handleClose={() => setPairStatistic(null)}
        items={[
          <div key="Change" className={cx('item')} onClick={() => setDisplayMode(DisplayMode.PriceChange)}>
            Change
          </div>,
          <div key="Volume" className={cx('item')} onClick={() => setDisplayMode(DisplayMode.Volume)}>
            Volume
          </div>,
        ]}
      />
    </>
  );
};

export default PairModal;
