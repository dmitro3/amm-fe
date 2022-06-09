import classnames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { TradingMethod } from 'src/constants/dashboard';
import { getClassNamePrice, TO_FIX_2 } from 'src/features/Pairs/components/Pairs';
import { displayData } from 'src/features/Pairs/helper';
import { Pair, PairFullInfo } from 'src/features/Pairs/interfaces/pair';
import { setSelectedPair } from 'src/features/Pairs/redux/pair';
import { fixPrecision } from 'src/helpers/fixPrecision';
import { getIconPairSelectByNetwork } from 'src/helpers/getIconPairSelected';
import { returnAmountBidAsk, returnPairParams } from 'src/helpers/pair';
import { THEME_MODE } from 'src/interfaces/theme';
import { useAppSelector } from 'src/store/hooks';
import styles from './PairBlock.module.scss';
const cx = classnames.bind(styles);

interface PairBlockProps {
  theme: THEME_MODE;
  pair: PairFullInfo;
  network: TradingMethod;
}

const PairBlock: React.FC<PairBlockProps> = ({ pair, theme, network }: PairBlockProps) => {
  // @ts-ignore
  const dispatch = useDispatch();
  const history = useHistory();
  const pairList: Pair[] = useAppSelector((state) => state.allPairs.pairs.data);
  const [basicInfoPair, setBasicInfoPair] = useState<Pair>();
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);

  useEffect(() => {
    setBasicInfoPair(pairList.find((e: Pair) => e.pairs_id === pair.pair_id));
  }, []);

  const gotoDashboard = () => {
    if (basicInfoPair) {
      history.push(`/trade/${returnPairParams(basicInfoPair)}`);
      dispatch(setSelectedPair(basicInfoPair));
    }
  };

  return (
    <div className={cx('wrapper')} onClick={gotoDashboard}>
      <div className={cx('name')}>
        <div className={cx('icon')}>
          <img src={getIconPairSelectByNetwork(network, selectedMethods, theme)} />
        </div>
        <div className={cx('pair-name')}>{pair.name}</div>
      </div>
      <div className={cx('divided')}></div>
      <div className={cx('price')}>
        <div className={cx('bid-price')}>
          <div className={cx('label')}>Bid price</div>
          <div className={cx('price')}>{pair.bid.price ? displayData(pair.bid.price, pair.price_precision) : '-'}</div>
          <div className={cx('amount')}>
            {pair.bid.amount
              ? returnAmountBidAsk(displayData(pair.bid.amount, pair.amount_precision), pair.amount_precision)
              : '-'}
          </div>
        </div>
        <div className={cx('divided')}></div>
        <div className={cx('ask-price')}>
          <div className={cx('label')}>Ask price</div>
          <div className={cx('price')}>{pair.ask.price ? displayData(pair.ask.price, pair.price_precision) : '-'}</div>
          <div className={cx('amount')}>
            {pair.ask.amount
              ? returnAmountBidAsk(displayData(pair.ask.amount, pair.amount_precision), pair.amount_precision)
              : '-'}
          </div>
        </div>
      </div>
      <div className={cx('divided')}></div>
      <div className={cx('price')}>
        <div className={cx('block-24h')}>
          <div className={cx('label')}>24h Change</div>
          <div className={cx('change-24h')}>
            <div className={cx('price-changed', getClassNamePrice(pair.price_change))}>
              {displayData(pair.price_change, pair.price_precision)}{' '}
            </div>
            <div className={cx('price-changed_percent', getClassNamePrice(pair.price_change_percent))}>{`${fixPrecision(
              pair.price_change_percent,
              TO_FIX_2,
            )}%`}</div>
          </div>
        </div>
        <div className={cx('block-24h')}>
          <div className={cx('label')}> 24h Volume({basicInfoPair?.base_symbol})</div>
          <div className={cx('volume')}>{displayData(pair.volume, TO_FIX_2)}</div>
        </div>
        <div className={cx('block-24h')}>
          <div className={cx('label')}> 24h Volume({basicInfoPair?.quote_symbol})</div>
          <div className={cx('volume')}>{displayData(pair.quote_volume, TO_FIX_2)}</div>
        </div>
      </div>
    </div>
  );
};

export default PairBlock;
