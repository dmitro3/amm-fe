import React from 'react';
import classNames from 'classnames/bind';
import stylesSCSS from 'src/features/User/Account/Management/Setting/styles/ConnectedWallets.module.scss';
const cx = classNames.bind(stylesSCSS);
import Pagination from '@material-ui/lab/Pagination';
import stylePanigation from './panigation';

const ConnectedWallets1: React.FC = () => {
  const classes = stylePanigation();
  return (
    <div className={cx('container')}>
      <div className={cx('header')}>
        <div>Connected wallets</div>
        <div>Submit address for whitelisting</div>
      </div>
      <div className={cx('table')}>
        <table>
          <tr>
            <th>Address</th>
            <th>Status</th>
            <th>Network support</th>
          </tr>
          <tr>
            <td>0x...89182eej8</td>
            <td>Whitelisted</td>
            <td>Stellar</td>
          </tr>
          <tr>
            <td>0x...89182eej8</td>
            <td>Whitelisted</td>
            <td>Stellar</td>
          </tr>
          <tr>
            <td>0x...89182eej8</td>
            <td>Whitelisted</td>
            <td>Stellar</td>
          </tr>
        </table>
      </div>
      <div className={cx('footer-pagination')}>
        <div>
          <Pagination
            className={classes.pagination}
            count={10}
            variant="outlined"
            shape="rounded"
            size="small"
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
export default ConnectedWallets1;
