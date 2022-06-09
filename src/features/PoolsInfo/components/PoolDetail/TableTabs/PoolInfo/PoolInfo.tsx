import { Box, createMuiTheme, Grid, Link, makeStyles, ThemeProvider, withStyles } from '@material-ui/core';
import LaunchIcon from '@material-ui/icons/Launch';
import moment from 'moment';
import React, { useEffect } from 'react';
import { getRights } from 'src/features/PoolsInfo/components/PoolDetail/TableTabs/PoolInfo/helper';
import { getCrpController } from 'src/features/PoolsInfo/components/RemoveLiquidityModal/helper/utils';
import { formatCurrencyAmount, formatFeePercent, formatPoolNumber } from 'src/features/PoolsInfo/helpers/dataFormatter';
import { currencySelector } from 'src/helpers/functional-currency';
import { Pool } from 'src/interfaces/pool';
import { THEME_MODE } from 'src/interfaces/theme';
import { FLEXIBLE_POOL_RIGHTS } from 'src/pages/PoolRequest/constants';
import { useAppSelector } from 'src/store/hooks';
import { InfoItem } from './InfoItem/InfoItem';
import { PriceMatrixTable } from './PriceMatrixTable/PriceMatrixTable';
import { Title } from './Title/Title';
import { Value } from './Value/Value';
import { ValueTable } from './ValueTable/ValueTable';

const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
  },
});

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

const InfoBox = withStyles((theme) => ({
  root: {
    borderRadius: '10px 10px 0 0',
    padding: '30px',
    backgroundColor: theme.palette.type === 'light' ? '#FAFAFA' : '#2A2C33',
  },
}))(Box);

const styleLink = makeStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',

    '& svg': {
      fill: 'var(--color-body)',
      marginLeft: '8px',
    },
  },
}));

interface Props {
  pool: Pool;
}

export const PoolInfo: React.FC<Props> = ({ pool }) => {
  const theme = useAppSelector((state) => state.theme.themeMode);
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency = useAppSelector(currencySelector);
  const [poolRights, setPoolRights] = React.useState<string[]>([]);

  const tokenTransform = (token: string) => {
    return `${token.slice(0, 5)}...${token.slice(-3).toLowerCase()}`;
  };

  const getLPTokenAddress = () => {
    return pool.crp ? pool.controller : pool.id;
  };

  const getPoolRights = async () => {
    const crp = await getCrpController(pool.id, 'controller');
    const rights = await getRights(crp);
    if (rights) {
      const poolRights: Array<string> = [];
      for (const [key, value] of Object.entries(rights)) {
        if (value && FLEXIBLE_POOL_RIGHTS[key]) {
          poolRights.push(FLEXIBLE_POOL_RIGHTS[key]);
        }
      }
      setPoolRights(poolRights);
    }
  };

  useEffect(() => {
    if (pool.id) {
      getPoolRights();
    }
  }, [pool.id]);

  // const camelCaseReadable = (name: string) => {
  //   const words = name.match(/[A-Z]{2}(s|es)|[A-Za-z][a-z]*/g) || [];
  //   return words
  //     .map((word, key) => {
  //       // capitalize first letter of the sentece
  //       if (key == 0) {
  //         return word.charAt(0).toUpperCase() + word.substring(1);
  //       }

  //       // decapitalize first letter of each word,
  //       // except for abbreviations, e.g.: LPs
  //       if (!word.match(/[A-Z]{2}(s|es)*/g)) {
  //         return word.charAt(0).toLowerCase() + word.substring(1);
  //       }

  //       return word;
  //     })
  //     .join(' ');
  // // };

  return (
    <>
      <ThemeProvider theme={theme == THEME_MODE.LIGHT ? lightTheme : darkTheme}>
        <InfoBox>
          <Grid container>
            <Grid item xs={3}>
              <InfoItem>
                <Title>Pool type</Title>
                <Value>{pool.crp ? 'Flexible Pool' : 'Fixed Pool'}</Value>
              </InfoItem>

              <InfoItem>
                <Title>Creation date</Title>
                <Value>{moment.unix(pool.createTime).format('DD/MM/YYYY HH:mm:ss')}</Value>
              </InfoItem>

              <InfoItem>
                <Title>Public swap</Title>
                <Value>{pool.publicSwap ? 'Enabled' : 'Disabled'}</Value>
              </InfoItem>

              <InfoItem>
                <Title>Total swap volume</Title>
                <Value>{formatCurrencyAmount(pool.totalSwapVolume, selectedCurrency, exchangeRates)}</Value>
              </InfoItem>

              <InfoItem>
                <Title>Total swap fee</Title>
                <Value>{formatCurrencyAmount(pool.totalSwapFee, selectedCurrency, exchangeRates)}</Value>
              </InfoItem>

              <InfoItem>
                <Title>FPT asset</Title>
                <Value>
                  <Link
                    href={`${process.env.REACT_APP_ETHERSCAN}/token/${getLPTokenAddress()}`}
                    underline="hover"
                    color="inherit"
                    target="_blank"
                    classes={styleLink()}
                  >
                    <span>{tokenTransform(pool.id)}</span>
                    <LaunchIcon fontSize="inherit" />
                  </Link>
                </Value>
              </InfoItem>
            </Grid>

            <Grid item xs={3}>
              <InfoItem>
                <Title>FPT total supply</Title>
                <Value>{formatPoolNumber(pool.totalShares, 1, '-')}</Value>
              </InfoItem>

              <InfoItem>
                <Title>Swap fee</Title>
                <Value>{formatFeePercent(pool.swapFee, 2)}%</Value>
              </InfoItem>

              <InfoItem>
                <Title>Swap fee ratio</Title>
                <ValueTable name="Velo admin" value={`${formatFeePercent(pool.protocolFee, 2)}%`} />
                <ValueTable name="Liquidity providers" value={`${formatFeePercent(pool.netFee, 2)}%`} />
              </InfoItem>
              {pool.crp && (
                <InfoItem>
                  <Title>Rights</Title>
                  {poolRights.map((right, index) => (
                    <Value key={index}>{right}</Value>
                  ))}
                </InfoItem>
              )}
            </Grid>

            <Grid item xs={6}>
              <InfoItem>
                <Title>Price matrix</Title>
                <PriceMatrixTable pool={pool} />
              </InfoItem>
            </Grid>
          </Grid>
        </InfoBox>
      </ThemeProvider>
    </>
  );
};
