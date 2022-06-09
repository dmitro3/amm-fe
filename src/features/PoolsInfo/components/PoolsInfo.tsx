import { Box, ButtonBase } from '@material-ui/core';
import classnames from 'classnames/bind';
import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Pool, Token } from 'src/interfaces/pool';
import { FEE_TYPE } from 'src/pages/PoolsList/constants';
import { getPoolDetailById } from 'src/services/pool';
import { useAppSelector } from 'src/store/hooks';
import styles from '../styles/PoolsInfo.module.scss';
import { AddLiquidityModal } from './AddLiquidityModal/AddLiquidityModal';
import Charts from './Charts/Charts';
import FeeButton from './FeeButton/FeeButton';
import Header from './Header/Header';
import PoolDetail from './PoolDetail/PoolDetail';
import { RemoveLiquidityModal } from './RemoveLiquidityModal/RemoveLiquidityModal';

const cx = classnames.bind(styles);

const PoolsInfo: FC<any> = (props: any) => {
  const wallet = useAppSelector((state) => state.wallet);
  const [addModal, setAddModal] = useState(false);
  const [removeModal, setRemoveModal] = useState(false);
  const [feeType, setFeeType] = useState(FEE_TYPE.GROSS);
  const [shouldUpdateData, setShouldUpdateData] = useState(false);
  const [series, setSeries] = useState<Array<Token>>([]);

  const [pool, setPool] = useState<Pool>({
    id: '',
    createTime: 0,
    crp: false,
    crpController: '',
    controller: '',
    finalized: false,
    name: '',
    symbol: '',
    liquidity: '',
    publicSwap: false,
    swapFee: '',
    protocolFee: '',
    rights: [],
    netFee: '',
    swaps: [],
    tokens: [],
    tokensList: [],
    shares: [],
    totalShares: '',
    totalSwapFee: '',
    totalNetFee: '',
    totalSwapVolume: '',
    totalWeight: '',
    joinsCount: '',
    adds: [],
    withdraws: [],
    swapsCount: '',
    myLiquidity: '',
    myShareBalance: '0',
    myLPTokenSymbol: '',
  });
  const { match } = props;

  useEffect(() => {
    if (shouldUpdateData) {
      getPoolDetailById(match.params.id, wallet.bsc).then((pool) => {
        setPool(pool);
        setSeries(pool.tokens);
        setShouldUpdateData(false);
      });
    }
  }, [shouldUpdateData]);

  useEffect(() => {
    getPoolDetailById(match.params.id, wallet.bsc).then((pool) => {
      setPool(pool);
      setSeries(pool.tokens);
    });
  }, [wallet.bsc]);

  return (
    <>
      <div className={cx('pools-info')} id="pool-info">
        <Box width="100%" display="flex" flexDirection="row" justifyContent="space-between">
          <FeeButton onFeeTypeChange={(feeType) => setFeeType(feeType)} />
          <Box className={cx('button')} display="flex" flexDirection="row">
            <ButtonBase
              className={cx('button__remove')}
              onClick={() => {
                setRemoveModal(true);
              }}
            >
              Remove
            </ButtonBase>
            <ButtonBase
              className={cx('button__add')}
              onClick={() => {
                setAddModal(true);
              }}
            >
              Add
            </ButtonBase>
          </Box>
        </Box>
        <Header pool={pool} feeType={feeType} series={series} />
        <Charts
          poolId={match.params.id}
          feeType={feeType}
          shouldUpdateData={shouldUpdateData}
          setShouldUpdateData={(val: boolean) => setShouldUpdateData(val)}
        />
        <PoolDetail pool={pool} />
        <AddLiquidityModal
          modal={addModal}
          setModal={() => {
            setAddModal(false);
          }}
          setShouldUpdateData={(val: boolean) => setShouldUpdateData(val)}
          pool={pool}
          series={series}
        />
        <RemoveLiquidityModal
          modal={removeModal}
          setModal={() => {
            setRemoveModal(false);
          }}
          setShouldUpdateData={(val: boolean) => setShouldUpdateData(val)}
          pool={pool}
          series={series}
        />
      </div>
    </>
  );
};

export default withRouter(PoolsInfo);
