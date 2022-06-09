import classnames from 'classnames/bind';
import React, { useEffect } from 'react';
import Select2, { ISelect } from 'src/components/Base/Select2/Select2';
import SORTypeTooltip from 'src/features/OrderForm/components/Tooltip/SORTypeTooltip';
import { SORType } from 'src/features/OrderForm/constants/sorType';
import { setSORType } from 'src/features/OrderForm/redux/orderForm';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styles from './SORTypeSelect.module.scss';

const cx = classnames.bind(styles);

const SORTypeSelect: React.FC = () => {
  const options: Array<ISelect> = [
    {
      label: SORType.MARKET_SOR,
      value: SORType.MARKET_SOR,
    },
    {
      label: SORType.USER_SOR,
      value: SORType.USER_SOR,
    },
  ];
  const sorType = useAppSelector((state) => state.orderForm.sorType);
  const dispatch = useAppDispatch();
  const selectedMethod = useAppSelector((state) => state.trading.selectedMethods);

  const handleSelect = (v: any) => {
    dispatch(setSORType(v.value));
  };

  const getOption = (sorType: SORType): ISelect => {
    return options.find((data) => data.value === sorType) || options[0];
  };

  useEffect(() => {
    dispatch(setSORType(options[0].value));
  }, [selectedMethod.length]);

  return (
    <>
      <div className={cx('container')}>
        <Select2
          options={options}
          option={getOption(sorType)}
          onClick={handleSelect}
          variant={'raw'}
          className={cx('select')}
        />
        <SORTypeTooltip />
      </div>
    </>
  );
};

export default SORTypeSelect;
