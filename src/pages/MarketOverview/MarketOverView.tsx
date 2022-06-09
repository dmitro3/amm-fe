import { Button, Typography } from '@material-ui/core';
import { KeyboardArrowDownRounded } from '@material-ui/icons';
import classnames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import Dropdown from 'src/components/Dropdown';
import { TradingMethod } from 'src/constants/dashboard';
import { isSinglePancakeswapLP } from 'src/features/OrderForm/helpers/network/checkNetwork';
import { PairFullInfo } from 'src/features/Pairs/interfaces/pair';
import { getNetworkOBFromSelectedMethod } from 'src/helpers/getNetworkOB';
import { getPairFullInfo } from 'src/helpers/pair';
import { TradingMethodItem } from 'src/interfaces';
import { SelectItem } from 'src/interfaces/user';
import { useAppSelector } from 'src/store/hooks';
// import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';
import PairBlock from './components/PairBlock';
import { Volume, VolumeOptions } from './constants';
import styles from './MarketOverview.module.scss';

const cx = classnames.bind(styles);

const MarketOverview: React.FC = () => {
  const [volume, setVolume] = useState<SelectItem>(VolumeOptions[0]);
  const [volumeRef, setVolumeRef] = useState<HTMLButtonElement | null>(null);
  const selectedTradingMethod = useAppSelector((state) => state.trading.selectedMethods);
  const theme = useAppSelector((state) => state.theme.themeMode);
  const pairs = useAppSelector((state) => state.allPairs.pairs.data);
  const pairInfos = useAppSelector((state) => state.pair.pairInfos);
  const [pairFullInfos, setPairFullInfos] = useState<Array<PairFullInfo>>([]);
  const [lpPairs, setLpPairs] = useState<Array<PairFullInfo>>([]);
  const [obPairs, setObPairs] = useState<Array<PairFullInfo>>([]);
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const Volumes = (volumeOptions: Array<SelectItem>): Array<JSX.Element> => {
    return volumeOptions.map((volume: SelectItem) => (
      <div key={volume.key} className={cx('dropdown-item')} onClick={() => setVolume(volume)}>
        {volume.text}
      </div>
    ));
  };
  useEffect(() => {
    if (!!pairs?.length && !!pairInfos?.length) {
      const cookedDataOB = getPairFullInfo(pairs, pairInfos, getNetworkOBFromSelectedMethod(selectedMethods));
      const cookedDataLiq = getPairFullInfo(pairs, pairInfos, TradingMethod.BSCPool);
      setPairFullInfos(cookedDataOB.concat(cookedDataLiq));
    }
  }, [pairs, pairInfos, selectedMethods]);
  useEffect(() => {
    let isIncludeLp = false;
    let obPairList: Array<PairFullInfo> = [];
    let lpPairList: Array<PairFullInfo> = [];
    if (selectedTradingMethod.findIndex((method: TradingMethodItem) => method.key === TradingMethod.BSCPool) >= 0) {
      lpPairList = pairFullInfos.filter((pair: PairFullInfo) => pair.network === TradingMethod.BSCPool);
      isIncludeLp = true;
    }
    if (selectedTradingMethod.length === 3) {
      obPairList = pairFullInfos.filter((pair: PairFullInfo) => pair.network !== TradingMethod.BSCPool);
    } else if (selectedTradingMethod.length === 2) {
      if (!isIncludeLp) {
        obPairList = pairFullInfos.filter((pair: PairFullInfo) => pair.network !== TradingMethod.BSCPool);
      } else {
        const id = selectedTradingMethod.filter((method: TradingMethodItem) => method.key !== TradingMethod.BSCPool)[0]
          .key;
        obPairList = pairFullInfos.filter((pair: PairFullInfo) => pair.network === id);
      }
    } else {
      if (!isIncludeLp) {
        const id = selectedTradingMethod[0].key;
        obPairList = pairFullInfos.filter((pair: PairFullInfo) => pair.network === id);
      } else {
        obPairList = [];
      }
    }
    if (volume.value === Volume.LOWEST) {
      setLpPairs(lpPairList.sort((pairA: PairFullInfo, pairB: PairFullInfo) => pairA.volume - pairB.volume));
      setObPairs(obPairList.sort((pairA: PairFullInfo, pairB: PairFullInfo) => pairA.volume - pairB.volume));
    } else {
      setLpPairs(lpPairList.sort((pairA: PairFullInfo, pairB: PairFullInfo) => pairB.volume - pairA.volume));
      setObPairs(obPairList.sort((pairA: PairFullInfo, pairB: PairFullInfo) => pairB.volume - pairA.volume));
    }
  }, [selectedTradingMethod, pairFullInfos, volume]);
  return (
    <>
      <div className={cx('wrapper')}>
        <div className={cx('header')}>
          <div className={cx('label-filter')}>Volume</div>
          <Button
            endIcon={<KeyboardArrowDownRounded className={cx('arrow-icon')} />}
            className={cx('volume-ref')}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => setVolumeRef(event.currentTarget)}
            fullWidth
          >
            <Typography className={cx('font-weight-bold', 'text-color')}>{volume.text}</Typography>
          </Button>
        </div>

        {!!obPairs.length && (
          <div className={cx('pairs')}>
            <div className={cx('title')}>Order book</div>
            <div className={cx('pair-list')}>
              {obPairs.map((pair: PairFullInfo) => (
                <PairBlock
                  pair={pair}
                  key={pair.pair_id}
                  theme={theme}
                  network={getNetworkOBFromSelectedMethod(selectedMethods)}
                />
              ))}
            </div>
          </div>
        )}

        {!!lpPairs.length && (
          <div className={cx('pairs')}>
            <div className={cx('title')}>Liquidity pool</div>
            <div className={cx('pair-list')}>
              {lpPairs.map((pair: PairFullInfo) => (
                <PairBlock pair={pair} key={pair.pair_id} theme={theme} network={TradingMethod.BSCPool} />
              ))}
            </div>
          </div>
        )}

        {isSinglePancakeswapLP(selectedMethods) && (
          <div className={cx('err-message')}>
            Sorry, market overview for Pancakeswap liquidity pools is not available.
          </div>
        )}
      </div>
      <Dropdown
        open={Boolean(volumeRef)}
        refElm={volumeRef}
        handleClose={() => setVolumeRef(null)}
        items={Volumes(VolumeOptions)}
        className={cx('volume-dropdown')}
      />
    </>
  );
};
export default MarketOverview;
