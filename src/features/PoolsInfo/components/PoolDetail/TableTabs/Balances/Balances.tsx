import React, { useEffect, useState } from 'react';
import CDataGrid from 'src/components/DataGrid';
import { NoRows } from 'src/components/DataGrid/DataGrid';
import { formatPoolNumber, formatPoolPercent } from 'src/features/PoolsInfo/helpers/dataFormatter';
import { disableDragDrop } from 'src/helpers/disableDragDrop';
import { Balance } from 'src/interfaces/pool';
import styles from 'src/features/PoolsInfo/components/PoolDetail/TableTabs/Transactions/Transactions.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const columns = [
  {
    field: 'digitalCredits',
    sortable: false,
    headerName: 'Digital credits',
    headerClassName: cx('header-text-style'),
    cellClassName: cx('transaction-text-style'),
    flex: 1,
  },
  {
    field: 'weight',
    sortable: false,
    headerName: 'Weight',
    headerClassName: cx('header-text-style'),
    cellClassName: cx('transaction-text-style'),
    flex: 1,
  },
  {
    field: 'poolBalance',
    sortable: false,
    headerName: 'Pool balance',
    headerClassName: cx('header-text-style'),
    cellClassName: cx('transaction-text-style'),
    flex: 1,
  },
  {
    field: 'myBalance',
    sortable: false,
    headerName: 'My balance',
    headerClassName: cx('header-text-style'),
    cellClassName: cx('transaction-text-style'),
    flex: 1,
  },
  {
    field: 'myAssetValue',
    sortable: false,
    headerName: 'My asset value',
    headerClassName: cx('header-text-style'),
    cellClassName: cx('transaction-text-style'),
    flex: 1,
  },
];

interface Props {
  balances: Balance[];
}

export const Balances: React.FC<Props> = ({ balances }) => {
  const [localBalances, setLocalBalances] = useState<any[]>([]);

  useEffect(() => {
    const newBalances = balances.map((balance, index) => ({
      id: index,
      ...balance,
      poolBalance: formatPoolNumber(balance.poolBalance, 1),
      weight: `${formatPoolPercent(balance.weight, 2)}%`,
      myBalance: balance.myBalance != '-' ? formatPoolNumber(balance.myBalance, 1) : balance.myBalance,
      myAssetValue: balance.myAssetValue ? balance.myAssetValue : '-',
    }));

    setLocalBalances(newBalances);
  }, [balances]);

  useEffect(() => {
    disableDragDrop('data-grid');
  }, []);

  return (
    <div id="data-grid">
      <CDataGrid
        rows={localBalances}
        columns={columns}
        hideFooterRowCount
        hideFooterSelectedRowCount
        disableColumnReorder={true}
        disableColumnMenu
        hideFooterPagination
        autoHeight
        components={{
          NoRowsOverlay: NoRows,
        }}
        rowHeight={44}
        headerHeight={36}
      />
    </div>
  );
};
