import { Box, createStyles, Tab, Tabs, Theme, Tooltip, Typography, withStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames/bind';
import { currencySelector } from 'src/helpers/functional-currency';
import { Balance, Pool } from 'src/interfaces/pool';
import { getTokenPrices } from 'src/services/pool';
import { useAppSelector } from 'src/store/hooks';
import { Balances } from './Balances/Balances';
import { MyInfo } from './MyInfo/MyInfo';
import { PoolInfo } from './PoolInfo/PoolInfo';
import styles from './TableTabs.module.scss';
import { Transactions } from './Transactions/Transactions';
import {
  formatCurrencyAmount,
  formatTokenAmount,
  setDataPrecision,
} from 'src/features/PoolsInfo/helpers/dataFormatter';
import { HelpOutline } from '@material-ui/icons';
import CLoading from 'src/components/Loading';

const cx = classnames.bind(styles);
const CustomTabs = withStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.type === 'light' ? '#F5F5F5' : '#232424',
    border: 'none',
  },
  indicator: {
    backgroundColor: '#1890ff',
  },
}))(Tabs);

const CustomTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      fontSize: '16px',
      '&$selected': {
        color: theme.palette.type === 'light' ? '#4E4B66' : '#FFFFFF',
        fontWeight: 'bolder',
      },
    },
    selected: {},
  }),
)((props: any) => <Tab {...props} />);

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={1} style={{ marginTop: '15px', padding: '0' }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const tabs: TabItem[] = [
  {
    name: 'Balances',
    event: 'balances',
  },
  {
    name: 'Transactions',
    event: 'transactions',
  },
  {
    name: `Pool's info`,
    event: 'pool-info',
  },
  {
    name: 'My info',
    event: 'my-info',
    tooltip: 'Click Update button to update data',
  },
];

export interface TabItem {
  name: string;
  event: string;
  tooltip?: string;
}

interface Props {
  pool: Pool;
}

const scrollToRef = (ref: any) => {
  window.scrollBy({
    top: ref.current.offsetTop,
    left: 0,
    behavior: 'smooth',
  });
};

export const TableTabs: React.FC<Props> = ({ pool }) => {
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency = useAppSelector(currencySelector);
  const tabPanelRef = useRef(null);
  const [value, setValue] = useState(0);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [tokenPrices, setTokenPrices] = useState<{ price: string; symbol: string }[]>([]);

  const handleChange = (event: React.ChangeEvent<any>, newValue: number) => {
    scrollToRef(tabPanelRef);
    setValue(newValue);
  };

  const tokenWeight = (tokenDenorm: string, poolTotal: string) => {
    return (parseInt(tokenDenorm) / parseInt(poolTotal)).toString();
  };

  useEffect(() => {
    getTokenPrices().then((data) => {
      setTokenPrices(data);
    });
  }, []);

  const getTokenPrice = (symbol: string): string => {
    for (const rate of tokenPrices) {
      if (rate.symbol === symbol) return rate.price;
    }
    return '0';
  };

  useEffect(() => {
    const hasTotalShares = new BigNumber(pool.totalShares || '0').gt('0');
    const ratio = hasTotalShares ? new BigNumber(pool.myShareBalance).div(pool.totalShares) : new BigNumber('0');
    const balancesArr = pool.tokens.map((token) => {
      const tokenBalance = ratio.times(token.balance);
      const tokenValue = tokenBalance.times(getTokenPrice(token.symbol));
      return {
        poolBalance: setDataPrecision(token.balance, 6),
        weight: tokenWeight(token.denormWeight, pool.totalWeight),
        digitalCredits: token.symbol,
        myBalance: formatTokenAmount(tokenBalance.toString()),
        myAssetValue: formatCurrencyAmount(tokenValue.toString(), selectedCurrency, exchangeRates),
      };
    });

    setBalances(balancesArr);
  }, [pool.tokens, selectedCurrency, exchangeRates]);

  return (
    <>
      <div className={cx('table-tabs')}>
        <CustomTabs
          value={value}
          aria-label="navigation tabs"
          onChange={(event, newValue) => handleChange(event, newValue)}
        >
          {tabs.map((tab, index: number) => (
            <CustomTab
              label={
                <Box display="flex" alignItems="center">
                  {tab.name}
                  {tab.tooltip && (
                    <Tooltip classes={{ tooltip: cx('wrapper') }} title={tab.tooltip} placement="top">
                      <HelpOutline fontSize="inherit" style={{ fill: 'var(--color-body)', marginLeft: '8px' }} />
                    </Tooltip>
                  )}
                </Box>
              }
              key={tab.name}
              value={index}
            ></CustomTab>
          ))}
        </CustomTabs>
        {!pool.id ? (
          <div className={cx('loading')}>
            <CLoading size="md" type="spin" />
          </div>
        ) : (
          <div className={cx('tabs-panel')} ref={tabPanelRef}>
            <TabPanel value={value} index={0}>
              <Balances balances={balances} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Transactions pool={pool} />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <PoolInfo pool={pool} />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <MyInfo pool={pool} />
            </TabPanel>
          </div>
        )}
      </div>
    </>
  );
};
