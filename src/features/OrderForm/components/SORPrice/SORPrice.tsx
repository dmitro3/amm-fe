import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React from 'react';
import CLoading from 'src/components/Loading';
import styles from 'src/features/OrderForm/components/SORPrice/SORPrice.module.scss';
import { useAppSelector } from 'src/store/hooks';

const cx = classnames.bind(styles);

interface Props {
  // behaviour: Behaviour;
  // option?: string;
  price: string;
}

const SORPrice: React.FC<Props> = ({ price }) => {
  // const sorData = useAppSelector((state) => state.sor);
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  const isLoading = useAppSelector((state) => state.sor.isLoadingSORData);
  // const [currentPrice, setCurrentPrice] = useState<string>('');

  // useEffect(() => {
  //   setCurrentPrice(sorData.averagePrice);
  //   if (option === 'Total') {
  //     setCurrentPrice(new BigNumber(1).div(sorData.averagePrice).toString());
  //   }
  // }, [sorData, option]);

  return (
    <>
      {selectedPair && (
        <div className={cx('container')}>
          <div className={cx('price')}>
            <div>SOR price</div>
            {isLoading ? (
              // <div>Loading...</div>
              <CLoading type={'text'} size={'sm'} />
            ) : (
              <div>
                {/*{new BigNumber(currentPrice).gt(0) ? new BigNumber(currentPrice).toFixed(4) : '-'}{' '}*/}
                {new BigNumber(price).gt(0) ? new BigNumber(price).toFixed(4) : '-'} {selectedPair.quote_symbol}
              </div>
            )}
          </div>
          <div className={cx('execute-time')}>Executing time: 20 - 30 seconds</div>
        </div>
      )}
    </>
  );
};

export default SORPrice;
