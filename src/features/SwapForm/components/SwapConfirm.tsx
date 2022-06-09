import { Box, ButtonBase, Dialog, Grid, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classNames from 'classnames/bind';
import React from 'react';
import BscSVG from 'src/assets/icon/BscSVG';
import StellarSVG from 'src/assets/icon/StellarSVG';
import Button from 'src/components/Base/Button/Button';
import { TradingMethod } from 'src/constants/dashboard';
import { SORType } from 'src/features/OrderForm/constants/sorType';
import styles from 'src/features/SwapForm/styles/SwapConfirm.module.scss';
import { TradingMethodItem } from 'src/interfaces';
import { useAppSelector } from 'src/store/hooks';

const cx = classNames.bind(styles);

interface SwapConfirmData {
  amountFrom: string;
  amountTo: string;
  slippage: string;
  modal: boolean;
  pricePerUnit: string;
  setModal: (v: boolean) => void;
  onSubmit: () => void;
  loading: boolean;
  sorType: SORType;
}

const SwapConfirm: React.FC<SwapConfirmData> = ({ ...props }) => {
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const isCombineMethod = () => {
    let isLiq = false;
    let isOBBsc = false;
    let isOBStellar = false;
    let isPancakeswapLP = false;
    selectedMethods?.map((item) => {
      if (item.key === TradingMethod.BSCPool) {
        isLiq = true;
      } else if (item.key === TradingMethod.BSCOrderbook) {
        isOBBsc = true;
      } else if (item.key === TradingMethod.StellarOrderbook) {
        isOBStellar = true;
      } else if (item.key === TradingMethod.PancakeswapPool) {
        isPancakeswapLP = true;
      }
    });
    return { isLiq: isLiq, isOBBsc: isOBBsc, isOBStellar: isOBStellar, isPancakeswapLP: isPancakeswapLP };
  };

  const getMethodElement = (selectedMethod: TradingMethodItem, key: number) => {
    if (selectedMethod.key === TradingMethod.StellarOrderbook) {
      return (
        <div key={key} className={cx('with-icon', 'stellar-icon')}>
          {key !== 0 && '&'}&nbsp;
          <StellarSVG size={'lg'} />
          Order Book
        </div>
      );
    } else if (selectedMethod.key === TradingMethod.BSCOrderbook) {
      return (
        <div key={key} className={cx('with-icon')}>
          {key !== 0 && '&'}&nbsp;
          <BscSVG size={'lg'} />
          Order Book
        </div>
      );
    } else if (selectedMethod.key === TradingMethod.BSCPool) {
      return (
        <div key={key} className={cx('with-icon')}>
          {key !== 0 && '&'}&nbsp;
          <BscSVG size={'lg'} />
          FCX Liquidity Pool
        </div>
      );
    } else if (selectedMethod.key === TradingMethod.PancakeswapPool) {
      return (
        <div key={key} className={cx('with-icon')}>
          {key !== 0 && '&'}&nbsp;
          <BscSVG size={'lg'} />
          Pancakeswap Liquidity Pool
        </div>
      );
    }
  };

  const renderMethodElements = (selectedMethods: Array<TradingMethodItem>) => {
    return selectedMethods.map((value, key) => {
      return <>{getMethodElement(value, key)}</>;
    });
  };

  return (
    <>
      <Dialog
        className={cx('dialog')}
        open={props.modal}
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            if (!props.loading) {
              props.setModal(false);
            }
          }
        }}
        fullWidth={true}
      >
        <Grid container alignItems="center" className={cx('header')}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Typography variant="h5" className={cx('header__title')}>
              Order confirmation
            </Typography>
          </Grid>

          <Grid item xs={1}>
            <IconButton
              onClick={() => {
                if (!props.loading) props.setModal(false);
              }}
              className={cx('header__button-close')}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Box className={cx('content')}>
          <div className={cx('details')}>
            <span className={cx('label')}>Method: </span>
            {renderMethodElements(selectedMethods)}
          </div>
          {(isCombineMethod().isOBBsc || isCombineMethod().isOBStellar) && (
            <div className={cx('details')}>
              <span className={cx('label')}>SOR Type: </span> {props.sorType}
            </div>
          )}
          <div className={cx('details')}>
            <span className={cx('label')}>First asset amount: </span> {props.amountFrom}
          </div>
          <div className={cx('details')}>
            <span className={cx('label')}>Second asset amount: </span> {props.amountTo}
          </div>
          <div className={cx('details')}>
            <span className={cx('label')}>Price per unit: </span> {props.pricePerUnit}
          </div>
          <div className={cx('details')}>
            <span className={cx('label')}>Slippage tolerance: </span> {`${props.slippage}%`}
          </div>
        </Box>
        <div className={cx('footer')}>
          <Button
            content="Trade"
            type="primary"
            size="md"
            fullWidth={true}
            onClick={() => {
              props.onSubmit();
            }}
            isLoading={props.loading}
          />
          <ButtonBase className={cx('button-back')} disabled={props.loading} onClick={() => props.setModal(false)}>
            Come back to trade module
          </ButtonBase>
        </div>
      </Dialog>
    </>
  );
};

export default SwapConfirm;
