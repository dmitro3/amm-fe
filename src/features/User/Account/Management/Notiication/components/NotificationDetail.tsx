import React from 'react';
import LayoutAccount from 'src/layouts/LayoutAccount/LayoutAccount';
import styles from 'src/features/User/Account/Management/Notiication/styles/NotificationDetail.module.scss';
import classnames from 'classnames/bind';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getCoinsApi } from 'src/helpers/coinHelper/coin.slice';
import { useHistory } from 'react-router-dom';
import {
  getPoolCreatedNotificationDetail,
  getPoolRequestNotificationDetail,
} from 'src/features/User/Account/Management/Notiication/redux/apis';
import { PoolStatus, PoolType, PoolTypeCreated } from 'src/features/User/Account/Management/Notiication/const';
import { CButton } from 'src/components/Base/Button';
import { routeConstants } from 'src/constants';
import { TokenIcon } from 'src/pages/PoolsList/helpers/TokenIcon';
import { Token } from 'src/pages/PoolRequest/interfaces';
import { formatPoolPercent, setDataPrecision } from 'src/features/PoolsInfo/helpers/dataFormatter';
import { FLEXIBLE_POOL_RIGHTS } from 'src/pages/PoolRequest/constants';
import { clearPoolRequestDetail } from 'src/features/User/Account/Management/Notiication/redux/notification.slice';
import BigNumber from 'bignumber.js';
import useScrollToTop from 'src/hooks/useScrollToTop';
import {
  ChangesPoolRequest,
  NotificationPoolRequest,
} from 'src/features/User/Account/Management/Notiication/interfaces';
import isEmpty from 'lodash/isEmpty';
import { countPoolRequest } from 'src/pages/PoolRequest/PoolRequest.slice';
import WarningPopup from 'src/pages/PoolRequest/components/WarningPopup';

const cx = classnames.bind(styles);

const NotificationDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [poolRequestDetail, poolCreatedDetail, coinsList] = useAppSelector((state) => [
    state.notification.poolRequestDetail.requested.data,
    state.notification.poolRequestDetail.created.data,
    state.allCoins.coins.data as Token[],
  ]);
  const urlParams = new URLSearchParams(window.location.search);
  const poolRequestID = urlParams.get('poolId');
  const poolAddress =
    poolRequestDetail && poolRequestDetail.status === PoolStatus.Created ? poolRequestDetail.pool_address : undefined;
  const [requested, setRequested] = React.useState<NotificationPoolRequest>();
  const [created, setCreated] = React.useState<NotificationPoolRequest>();
  const [displayData, setDisplayData] = React.useState<NotificationPoolRequest>();
  const [changes, setChanges] = React.useState<ChangesPoolRequest>();
  const [poolRequestNumber, setPoolRequestNumber] = React.useState(-1);
  const [openMaxPoolWarning, setOpenMaxPoolWarning] = React.useState(false);

  useScrollToTop();

  React.useEffect(() => {
    dispatch(getCoinsApi());
    dispatch(getPoolRequestNotificationDetail(Number(poolRequestID)));
    (async () => {
      setPoolRequestNumber(await countPoolRequest());
    })();
  }, []);

  React.useEffect(() => {
    poolRequestDetail &&
      poolRequestDetail.status === PoolStatus.Created &&
      poolAddress &&
      dispatch(getPoolCreatedNotificationDetail(poolAddress));
  }, [poolAddress]);

  React.useEffect(() => {
    return () => {
      dispatch(clearPoolRequestDetail());
    };
  }, []);

  React.useEffect(() => {
    !isEmpty(poolRequestDetail) &&
      setRequested({
        poolType: poolRequestDetail.type === PoolType.Flexible ? 'Flexible' : 'Fixed',
        tokens: poolRequestDetail.pool_coins?.reduce((prev, item) => {
          const tokenDetail = coinsList.find((coin) => coin.id === item.coin_id);

          return {
            ...prev,
            [String(tokenDetail?.bsc_address.toLowerCase())]: Number(item.weight).toFixed(2),
          };
        }, {}),
        totalWeight: poolRequestDetail.pool_coins?.reduce((prev, item) => prev + Number(item.weight), 0),
        swapFee: setDataPrecision(poolRequestDetail.swap_fee, 2),
        netFee: setDataPrecision(poolRequestDetail.fee_ratio_lp, 2),
        protocolFee: setDataPrecision(poolRequestDetail.fee_ratio_velo, 2),
        rights: poolRequestDetail.flex_right_config,
      });
  }, [coinsList, poolRequestDetail]);

  React.useEffect(() => {
    !isEmpty(poolCreatedDetail) &&
      setCreated({
        poolType: poolCreatedDetail.crp === PoolTypeCreated.Flexible ? 'Flexible' : 'Fixed',
        tokens: poolCreatedDetail.tokens.reduce((prev, item) => {
          return {
            ...prev,
            [item.address.toLowerCase()]: item.denormWeight,
          };
        }, {}),
        totalWeight: Number(poolCreatedDetail.totalWeight),
        swapFee: formatPoolPercent(poolCreatedDetail.swapFee),
        netFee: formatPoolPercent(poolCreatedDetail.netFee),
        protocolFee: formatPoolPercent(poolCreatedDetail.protocolFee),
        rights:
          poolCreatedDetail.rights.length > 0
            ? poolCreatedDetail.rights.reduce((prev, rightName) => {
                return { ...prev, [rightName]: true };
              }, {})
            : null,
      });
  }, [poolCreatedDetail]);

  React.useEffect(() => {
    requested && created && !isEmpty(poolRequestDetail) && poolRequestDetail.status === PoolStatus.Created
      ? setDisplayData(created)
      : setDisplayData(requested);
  }, [requested, created, poolRequestDetail]);

  React.useEffect(() => {
    requested &&
      created &&
      setChanges({
        poolType: created.poolType !== requested.poolType,
        tokens: Object.keys(created.tokens).reduce((prev, key) => {
          let isChange = false;
          if (requested.tokens[key]) {
            isChange = !new BigNumber(requested.tokens[key]).eq(created.tokens[key]);
          } else {
            isChange = true;
          }
          return { ...prev, [key]: isChange };
        }, {}),
        swapFee: !new BigNumber(requested.swapFee).eq(created.swapFee),
        netFee: !new BigNumber(requested.netFee).eq(created.netFee),
        protocolFee: !new BigNumber(requested.protocolFee).eq(created.protocolFee),
        rights: created.rights
          ? Object.keys(created.rights).reduce((prev, key) => {
              let isChange = false;
              if (requested.rights && created.rights && requested.rights[key]) {
                isChange = requested.rights[key] !== created.rights[key];
              } else {
                isChange = true;
              }
              return { ...prev, [key]: isChange };
            }, {})
          : null,
      });
  }, [requested, created]);

  return (
    <LayoutAccount>
      <div className={cx('header')}>
        {poolRequestDetail.status === PoolStatus.Created ? (
          <>
            <div>
              {changes && JSON.stringify(changes).includes('true')
                ? 'Approved pool request with changes'
                : 'Approved pool request'}
            </div>
            <CButton
              type="success"
              size="sm"
              content="Go to pool"
              onClick={() => (poolAddress ? history.push(`/pools/${poolAddress}`) : undefined)}
            />
          </>
        ) : poolRequestDetail.status === PoolStatus.Rejected ? (
          <>
            <div>Rejected pool request</div>

            <CButton
              size="sm"
              type="success"
              content="+ Request new pool"
              isDisabled={poolRequestNumber === -1}
              onClick={() =>
                poolRequestNumber >= 10 ? setOpenMaxPoolWarning(true) : history.push(routeConstants.POOL_REQUEST)
              }
            />

            <WarningPopup open={openMaxPoolWarning} handleClose={() => setOpenMaxPoolWarning(false)} />
          </>
        ) : null}
      </div>
      <div className={cx('container')}>
        <div className={cx('title')}>
          <div className={cx('message')}>
            <div className={cx('title-notification')}>Velo admin message</div>
            <div className={cx('text-notification')}>{poolRequestDetail.message}</div>
          </div>
          <div className={cx('type')}>
            <div className={cx('title-notification')}>Pool type</div>
            <div className={cx('text-notification', changes?.poolType ? 'change' : '')}>{displayData?.poolType}</div>
          </div>
        </div>

        <div className={cx('table')}>
          <table className={cx('theme-custom-table-poolrequest')}>
            <thead>
              <tr>
                <th className={cx('digital-credits-th')}>Digital credits</th>
                <th className={cx('weight-th')}>Weight</th>
                <th className={cx('percent-th')}>Percent</th>
                <th className={cx('empty')}></th>
              </tr>
            </thead>
            <tbody>
              {displayData &&
                displayData.tokens &&
                Object.keys(displayData.tokens).map((tokenAddress, index) => {
                  const tokenSymbol = coinsList.find(
                    (coin) => coin.bsc_address.toLowerCase() === tokenAddress.toLowerCase(),
                  )?.symbol;

                  return (
                    <tr className={cx(changes?.tokens[tokenAddress] ? 'change' : '')} key={index}>
                      <td className={cx('digital-credits-td')}>
                        {tokenSymbol && (
                          <div>
                            <TokenIcon name={tokenSymbol} size={25} />
                            <div>{tokenSymbol}</div>
                          </div>
                        )}
                      </td>
                      <td className={cx('weight-td')}>{displayData.tokens[tokenAddress]}</td>
                      <td className={cx('percent-td')}>
                        {((Number(displayData.tokens[tokenAddress]) / displayData.totalWeight) * 100).toFixed(2)}%
                      </td>
                      <td className={cx('empty')}></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className={cx('info')}>
          <div className={cx('fee')}>
            <div className={cx('title-notification')}>Swap fee(%)</div>
            <div className={cx('text-notification', changes?.swapFee ? 'change' : '')}>{displayData?.swapFee}%</div>
          </div>
          <div className={cx('ratio')}>
            <div className={cx('title-notification')}>Swap fee ratio(%)</div>
            <div className={cx('text-notification', changes?.protocolFee ? 'change-fee' : '')}>
              Velo admin: {displayData?.protocolFee === '-' ? '0.00' : displayData?.protocolFee}%
            </div>

            <div className={cx('text-notification', changes?.netFee ? 'change-fee' : '')}>
              Liquidity provider: {displayData?.netFee === '-' ? '0.00' : displayData?.netFee}%
            </div>
          </div>
          {displayData?.poolType === 'Flexible' && (
            <div className={cx('rights')}>
              <div className={cx('title-notification')}>Rights</div>

              {displayData.rights &&
                Object.keys(displayData.rights).map((rightName) => (
                  <div
                    className={cx('text-notification', changes?.rights && changes.rights[rightName] ? 'change' : '')}
                    key={rightName}
                  >
                    {FLEXIBLE_POOL_RIGHTS[rightName]}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </LayoutAccount>
  );
};

export default NotificationDetail;
