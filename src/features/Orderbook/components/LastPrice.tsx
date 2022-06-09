import React from 'react';
import { fixPrecision } from 'src/helpers/fixPrecision';
import { selectedPairInfoSelector } from 'src/helpers/pair';
import { useAppSelector } from 'src/store/hooks';

const LastPrice: React.FC = () => {
  const selectedPair: any = useAppSelector((state) => state.pair.selectedPair);
  const selectedPairInfo = useAppSelector(selectedPairInfoSelector);

  return (
    <h4 style={{ margin: '10px 0', minHeight: 20 }}>
      {' '}
      {selectedPairInfo?.last_price ? fixPrecision(selectedPairInfo?.last_price, selectedPair.price_precision) : '--'}
    </h4>
  );
};

export default LastPrice;
