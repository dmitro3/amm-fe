import React from 'react';
import classnames from 'classnames/bind';
import styles from './PrimaryButton.module.scss';

const cx = classnames.bind(styles);

interface PrimaryButtonProps {
  children: React.ReactNode;
  disable?: boolean;
  className?: string;
  onClick?: () => void;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className, disable, onClick }) => {
  return (
    <button className={cx('primary-button', disable ? 'disable' : '', className)} onClick={onClick}>
      {children}
    </button>
  );
};

export default PrimaryButton;
