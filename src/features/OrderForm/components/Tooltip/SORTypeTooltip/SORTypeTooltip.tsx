import { Tooltip } from '@material-ui/core';
import React from 'react';
import OutlinedQuestionMark from 'src/assets/icon/OutlinedQuestionMark';
import styles from './SORTypeTooltip.module.scss';
import classnames from 'classnames/bind';

const cx = classnames.bind(styles);

const SORTypeTooltip: React.FC = () => {
  return (
    <>
      <Tooltip
        title={'For Market SOR, system routes cross-network. For User SOR, system routes within each network'}
        arrow
      >
        <div className={cx('icon-container')}>
          <OutlinedQuestionMark />
        </div>
      </Tooltip>
    </>
  );
};

export default SORTypeTooltip;
