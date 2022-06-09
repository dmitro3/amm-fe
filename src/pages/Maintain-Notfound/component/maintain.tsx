import React from 'react';
import maintain from 'src/assets/img/maintain.png';
import classnames from 'classnames/bind';
import styles from 'src/pages/Maintain-Notfound/styles/maintain.module.scss';
const cx = classnames.bind(styles);
const MainTain: React.FC = () => {
  return (
    <div className={cx('maintain')}>
      <div>
        <img className={cx('img-maintain')} src={maintain} alt="" />
        <p className={cx('text')}>Emporary System Maintenance</p>
      </div>
    </div>
  );
};
export default MainTain;
