import React from 'react';
import { Tooltip } from '@material-ui/core';
import { HelpOutline } from '@material-ui/icons';
import classnames from 'classnames/bind';
import styles from '../Balances/Balances.module.scss';

export const cx = classnames.bind(styles);
interface Props {
  title: string;
}

const TooltipHelp: React.FC<Props> = ({ title = '' }) => {
  return (
    <Tooltip title={title}>
      <span style={{ marginRight: 4 }} className={cx('chart-element__info--tooltip')}>
        <HelpOutline style={{ color: 'var(--title-active)' }} fontSize={'inherit'} className={cx('tooltip-icon')} />
      </span>
    </Tooltip>
  );
};

export default TooltipHelp;
