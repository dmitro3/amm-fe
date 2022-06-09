import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import classnames from 'classnames/bind';
import React from 'react';
import { Pool } from 'src/interfaces/pool';
import { THEME_MODE } from 'src/interfaces/theme';
import { useAppSelector } from 'src/store/hooks';
import styles from './PoolDetail.module.scss';
import { TableTabs } from './TableTabs/TableTabs';

const cx = classnames.bind(styles);
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

export interface Props {
  pool: Pool;
}

const PoolDetail: React.FC<Props> = ({ pool }) => {
  const theme = useAppSelector((state) => state.theme.themeMode);

  return (
    <>
      <ThemeProvider theme={theme == THEME_MODE.LIGHT ? lightTheme : darkTheme}>
        <div className={cx('pool-details')}>
          <TableTabs pool={pool} />
        </div>
      </ThemeProvider>
    </>
  );
};

export default PoolDetail;
