import { Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import ArrowDownOutline from 'src/assets/icon/ArrowDownOutline';
import ArrowRightOutline from 'src/assets/icon/ArrowRightOutline';
import OutlinedQuestionMark from 'src/assets/icon/OutlinedQuestionMark';
import CLoading from 'src/components/Loading';
import { numberOfStdArray } from 'src/features/ConfidenceInterval/constances';
import { getMaxPrice, getMinPrice } from 'src/features/ConfidenceInterval/helpers/getMinMaxPrice';
import { getTimeFromInterval } from 'src/features/ConfidenceInterval/helpers/getTimeFromInterval';
import ConfidenceIntervalData from 'src/features/ConfidenceInterval/interfaces/ConfidenceIntervalData';
import { getInternalCalculation, getVolatility } from 'src/features/ConfidenceInterval/services';
import styles from 'src/features/ConfidenceInterval/styles/ConfidenceInterval.module.scss';
import { useAppSelector } from 'src/store/hooks';

const cx = classnames.bind(styles);

interface Props {
  effectiveExecutablePrice?: string | number | BigNumber;
  getFromSORData?: boolean;
}

const ConfidenceInterval: React.FC<Props> = ({ effectiveExecutablePrice, getFromSORData }) => {
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const sorData = useAppSelector((state) => state.sor);
  const [open, setOpen] = useState<boolean>(false);
  const [tableData, setTableData] = useState<Array<ConfidenceIntervalData>>([
    {
      confidenceInterval: '50%',
      minPrice: '',
      maxPrice: '',
    },
    {
      confidenceInterval: '68%',
      minPrice: '',
      maxPrice: '',
    },
    {
      confidenceInterval: '80%',
      minPrice: '',
      maxPrice: '',
    },
    {
      confidenceInterval: '90%',
      minPrice: '',
      maxPrice: '',
    },
    {
      confidenceInterval: '95%',
      minPrice: '',
      maxPrice: '',
    },
    {
      confidenceInterval: '99%',
      minPrice: '',
      maxPrice: '',
    },
  ]);
  const [volatility, setVolatility] = useState<string>('');
  const [internalCalculation, setInternalCalculation] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [duration, setDuration] = useState<string>('1');

  const toggle = () => {
    setOpen(!open);
  };

  const fetchDataTable = () => {
    try {
      const newData: Array<ConfidenceIntervalData> = [];
      for (const item of numberOfStdArray) {
        newData.push({
          confidenceInterval: item.confidenceInterval,
          minPrice: getMinPrice(price, volatility, internalCalculation, item.numberOfStd),
          maxPrice: getMaxPrice(price, volatility, internalCalculation, item.numberOfStd),
        });
      }
      setTableData(newData);
    } catch (e) {
      // console.log(e);
    }
  };

  const fetchData = async () => {
    const volatilityData = new BigNumber(await getVolatility()).div(100).toString();
    const confidenceData = await getInternalCalculation();

    setVolatility(volatilityData);
    setInternalCalculation(confidenceData?.calculation?.toString() || '');
    setDuration(confidenceData?.interval || '');
  };

  useEffect(() => {
    new BigNumber(price).gt(0) &&
      !new BigNumber(volatility).isNaN() &&
      !new BigNumber(internalCalculation).isNaN() &&
      fetchDataTable();
  }, [price, volatility, internalCalculation]);

  useEffect(() => {
    fetchData();
  }, []);

  // fetch price
  useEffect(() => {
    if (getFromSORData) {
      setPrice(sorData.price);
    } else {
      setPrice(effectiveExecutablePrice ? new BigNumber(effectiveExecutablePrice).toString() : '');
    }
  }, [effectiveExecutablePrice, sorData.price, selectedMethods]);

  return (
    <>
      <div className={cx('container')}>
        <div className={cx('header')} onClick={toggle}>
          <div className={cx('name')}>
            Confidence interval
            <Tooltip
              title={`Confidence Interval is an estimate of the price range that contains a given percentage${' '}
              (e.g., 95%) $of future executable price observations over the selected confidence interval duration${' '}
              (e.g., 48 hours) given a chosen volatility source (e.g., 1 hour for hourly volatility) and the live${' '}
              effective price at which the order could be executed immediately.`}
              arrow
              PopperProps={{
                className: 'tooltip-arrow-lg',
              }}
            >
              <div className={cx('icon-container')}>
                <OutlinedQuestionMark />
              </div>
            </Tooltip>
          </div>
          {open ? <ArrowDownOutline size={'lg'} /> : <ArrowRightOutline size={'lg'} />}
        </div>
        {open && (
          <div className={cx('body')}>
            <div className={cx('label')}>Your duration: {getTimeFromInterval(duration)}</div>
            {sorData.isLoadingSORData ? (
              // <div>Loading...</div>
              <CLoading type={'text'} size={'sm'} />
            ) : !(
                new BigNumber(price).gt(0) &&
                !new BigNumber(volatility).isNaN() &&
                !new BigNumber(internalCalculation).isNaN()
              ) ? (
              <div className={cx('not-available')}>Confidence interval is not available</div>
            ) : (
              <>
                <table className={cx('table')}>
                  <thead>
                    <tr>
                      <th>Confidence interval</th>
                      <th>Min price</th>
                      <th>Max price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((d, index) => (
                      <tr key={index}>
                        <td>{d.confidenceInterval}</td>
                        <td>{d.minPrice}</td>
                        <td>{d.maxPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ConfidenceInterval;
