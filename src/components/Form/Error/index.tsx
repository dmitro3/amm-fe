import React from 'react';
import classnames from 'classnames/bind';
import styles from './Error.module.scss';

const cx = classnames.bind(styles);

const Error: React.FC<{ errorName: string }> = (props) => {
  return <span className={cx('error')}>{props.errorName}</span>;
};

export default Error;
