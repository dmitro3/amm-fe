import React from 'react';
import style from '../styles/TradingView.module.scss';
import classNames from 'classnames/bind';

interface Props {
  content: React.ReactNode;
  active?: boolean;
  onClick?: (v: any) => void;
}
const ItemNavBar: React.FC<Props> = ({ content = '', active = false, onClick = () => {} }) => {
  const cx = classNames.bind(style);

  return (
    <div className={cx('item-navbar', active && 'item-active')} onClick={onClick}>
      {content}
    </div>
  );
};

export default ItemNavBar;
