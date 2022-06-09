/* eslint-disable react-hooks/exhaustive-deps */
import { Button, InputLabel, Typography } from '@material-ui/core';
import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';
import classnames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { CInput } from 'src/components/Base/Input';
import { ISelect } from 'src/components/Base/Select2/Select2';
import SelectMethod from 'src/features/MyTransactions/SlelectMethod/SelectMethod';
import { METHOD_FILTER, ModeDisplay, TFilter } from './Constant';
import { ICoin } from './DigitalCreditModal/Constant';
import DigitalCreditModal from './DigitalCreditModal/DigitalCreditModal';
import styles from './MyTransaction.module.scss';

const cx = classnames.bind(styles);
export interface IFilterBar {
  handleCancelOrder?: (orderId: number) => void;
  coinList?: any;
  pairList: any;
  walletList: any;
  handleFilterCondition?: (condition: any) => void;
  conditionFilter?: TFilter;
  itemFilter: string[];
  size?: 'md' | 'lg';
  modeDisplay?: number;
}
const FilterBar: React.FC<IFilterBar> = (props) => {
  const [pair, setPair] = useState<number>(-1);
  const [method, setMethod] = useState<number[]>([METHOD_FILTER[0].value]);
  const [orderId, setOrderId] = useState<string>();
  const [coinId, setCoinId] = useState<number>(-1);
  const [pool, setPool] = useState<string>('');
  const [conditionFilter, setConditionFilter] = useState<TFilter>({});
  const [refElm, setRefEml] = useState<HTMLButtonElement | null>(null);
  const filter = (condition?: TFilter) => {
    if (props.handleFilterCondition) {
      props.handleFilterCondition(condition ? condition : conditionFilter);
    }
  };
  useEffect(() => {
    if (props.conditionFilter) {
      setPair(props.conditionFilter.pair ? props.conditionFilter.pair : -1);
      setCoinId(props.conditionFilter.coinId ? props.conditionFilter.coinId : -1);
      setMethod(props.conditionFilter.method ? props.conditionFilter.method : [METHOD_FILTER[0].value]);
      setOrderId(props.conditionFilter.orderId ? props.conditionFilter.orderId : '');
      setPool(props.conditionFilter.pool ? props.conditionFilter.pool : '');
      setConditionFilter(props.conditionFilter);
      // filter(props.conditionFilter);
    }
  }, [props.conditionFilter]);

  const handleChangePair = (value: number) => {
    if (Number(value) === -1) {
      delete conditionFilter.pair;
    } else {
      conditionFilter.pair = value;
    }
    setPair(value);
    setConditionFilter(conditionFilter);
    filter();
  };

  const handleChangeMethod = (values: any) => {
    if (values.length > 0) {
      const methods: number[] = [];
      values.map((item: ISelect) => {
        methods.push(Number(item.value));
      });
      setMethod(methods);
      conditionFilter.method = methods;
      setConditionFilter(conditionFilter);
      filter();
    }
  };

  const handleChangeOrderId = (value: any) => {
    setOrderId(value);
    conditionFilter.orderId = value;
    setConditionFilter(conditionFilter);
  };

  const handleChangePool = (value: any) => {
    setPool(value);
    conditionFilter.pool = value;
    setConditionFilter(conditionFilter);
  };

  const handleSelectCoin = (value: number) => {
    if (value === -1) {
      delete conditionFilter?.coinId;
      setConditionFilter(conditionFilter);
    } else {
      conditionFilter.coinId = value;
      setConditionFilter(conditionFilter);
    }
    setCoinId(value);
    filter();
  };

  const converOptionsSelect = (arrayObj: any, labelKey1: string, valueKey: string, labelKey2?: string) => {
    const res: { label: string; value: string }[] = [];
    res.push({ value: '-1', label: 'All' });
    arrayObj.map((item: any) => {
      res.push({
        label: !labelKey2 ? item[labelKey1] : item[labelKey1] + '/' + item[labelKey2],
        value: item[valueKey],
      });
    });
    return res;
  };

  const getLabelByPairId = () => {
    const pairFilter = props.pairList.filter((e: any) => e.pairs_id === pair)[0];
    return pairFilter ? pairFilter.base_name + '/' + pairFilter.quote_name : 'All';
  };

  const getOptionFromMethodId = (methodId: number[]) => {
    const option: ISelect[] = [];
    METHOD_FILTER.map((item) => {
      methodId.map((id) => {
        if (item.value === id) {
          option.push({ value: id.toString(), label: item.label });
        }
      });
    });
    return option;
  };

  const getLabelFromCoinId = () => {
    const coin: ICoin = props.coinList?.find((e: ICoin) => e.id === coinId);
    if (coin) {
      return coin.name;
    }
    return 'All';
  };

  return (
    <div className={cx('filter-bar')}>
      {props.itemFilter.includes('pair') && (
        <div className={cx('div-select', props.modeDisplay === ModeDisplay.user && 'filter-dislay-user')}>
          <InputLabel
            className={cx(`label-select-${props.modeDisplay === ModeDisplay.dashboard ? 'dashboard' : 'user'}`)}
          >
            Pair:
          </InputLabel>
          <Button
            endIcon={<ArrowDropDownRoundedIcon className={cx(`arrow-icon-${props.size}`)} />}
            className={cx(`button-select-${props.size}`)}
            focusRipple={false}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => setRefEml(event.currentTarget)}
          >
            <Typography className={cx(`text-option-select-${props.size}`)}>{getLabelByPairId()}</Typography>
          </Button>
          <DigitalCreditModal
            open={Boolean(refElm)}
            handleClose={() => setRefEml(null)}
            refElm={refElm}
            options={converOptionsSelect(props.pairList, 'base_name', 'pairs_id', 'quote_name')}
            onClick={handleChangePair}
            modeDisplay={props.modeDisplay}
          />
        </div>
      )}
      {props.itemFilter.includes('orderId') && (
        <div className={cx('div-select')}>
          <InputLabel
            className={cx(`label-select-${props.modeDisplay === ModeDisplay.dashboard ? 'dashboard' : 'user'}`)}
          >
            Order ID:
          </InputLabel>
          <CInput
            placeholder="Search"
            defaultValue={orderId}
            onChange={(value: string) => handleChangeOrderId(value)}
            validateNumber={true}
            onKeyPress={() => {
              filter();
            }}
            classNamePrefix={cx(`input-filter-order-${props.size}`)}
            onBlur={() => filter()}
          />
        </div>
      )}
      {props.itemFilter.includes('method') && (
        <div className={cx('div-select', props.modeDisplay === ModeDisplay.user && 'filter-dislay-user')}>
          <InputLabel
            className={cx(`label-select-${props.modeDisplay === ModeDisplay.dashboard ? 'dashboard' : 'user'}`)}
          >
            Method:
          </InputLabel>
          <SelectMethod
            option={getOptionFromMethodId(method)}
            onClick={handleChangeMethod}
            options={METHOD_FILTER}
            size={props.size}
            endAdornment={<ArrowDropDownRoundedIcon className={cx(`arrow-icon-${props.size}`)} />}
          />
        </div>
      )}
      {props.itemFilter.includes('coin') && (
        <div className={cx('div-select')}>
          <InputLabel
            className={cx(`label-select-${props.modeDisplay === ModeDisplay.dashboard ? 'dashboard' : 'user'}`)}
          >
            Digital credit:
          </InputLabel>
          <Button
            endIcon={<ArrowDropDownRoundedIcon className={cx(`arrow-icon-${props.size}`)} />}
            className={cx(`button-select-${props.size}`)}
            focusRipple={false}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => setRefEml(event.currentTarget)}
          >
            <Typography className={cx('text-option-select')}>{getLabelFromCoinId()}</Typography>
          </Button>
          <DigitalCreditModal
            open={Boolean(refElm)}
            handleClose={() => setRefEml(null)}
            refElm={refElm}
            options={props.coinList ? converOptionsSelect(props.coinList, 'name', 'id') : []}
            onClick={handleSelectCoin}
            modeDisplay={props.modeDisplay}
          />
        </div>
      )}
      {props.itemFilter.includes('pool') && (
        <div className={cx('div-select')}>
          <InputLabel
            className={cx(`label-select-${props.modeDisplay === ModeDisplay.dashboard ? 'dashboard' : 'user'}`)}
          >
            Pool:
          </InputLabel>
          <CInput
            size="sm"
            placeholder="Search"
            defaultValue={pool}
            onChange={(value: string) => handleChangePool(value)}
            onKeyPress={() => {
              filter();
            }}
            classNamePrefix={cx(`input-filter-order-${props.size}`)}
            onBlur={() => filter()}
          />
        </div>
      )}
    </div>
  );
};

export default FilterBar;
