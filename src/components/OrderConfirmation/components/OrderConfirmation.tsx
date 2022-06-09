import { Box, ButtonBase, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import React from 'react';
import BscSVG from 'src/assets/icon/BscSVG';
import StellarSVG from 'src/assets/icon/StellarSVG';
import Button from 'src/components/Base/Button/Button';
import { OrderConfirmationData } from 'src/components/OrderConfirmation/interfaces';
import styles from 'src/components/OrderConfirmation/styles/OrderConfirmation.module.scss';
import { TradingMethod } from 'src/constants/dashboard';
import { EORDER_TYPE } from 'src/features/MyTransactions/Constant';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { SORType } from 'src/features/OrderForm/constants/sorType';
import { TimeInForce } from 'src/features/OrderForm/constants/timeInForce';
import { TradingMethodItem } from 'src/interfaces';

const cx = classnames.bind(styles);

interface Props {
  open: boolean;
  isOnProcess: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitContent: string;
  data: OrderConfirmationData;
}

const OrderConfirmation: React.FC<Props> = (props) => {
  const getMethodElement = (selectedMethod: TradingMethodItem, key: number) => {
    if (selectedMethod.key === TradingMethod.StellarOrderbook) {
      return (
        <div key={key} className={cx('value', 'method', 'stellar-icon')}>
          {key !== 0 && '&'}&nbsp;
          <StellarSVG size={'lg'} />
          Order Book
        </div>
      );
    } else if (selectedMethod.key === TradingMethod.BSCOrderbook) {
      return (
        <div key={key} className={cx('value', 'method')}>
          {key !== 0 && '&'}&nbsp;
          <BscSVG size={'lg'} />
          Order Book
        </div>
      );
    } else if (selectedMethod.key === TradingMethod.BSCPool) {
      return (
        <div key={key} className={cx('value', 'method')}>
          {key !== 0 && '&'}&nbsp;
          <BscSVG size={'lg'} />
          FCX Liquidity Pool
        </div>
      );
    } else if (selectedMethod.key === TradingMethod.PancakeswapPool) {
      return (
        <div key={key} className={cx('value', 'method')}>
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
        open={props.open}
        onClose={props.onClose}
        fullWidth={true}
        maxWidth={'sm'}
        disableBackdropClick={props.isOnProcess}
        disableEscapeKeyDown={true}
      >
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography component={'div'}>
            <IconButton size={'small'} className={cx('hidden')}>
              <CloseIcon />
            </IconButton>
          </Typography>

          <Typography component={'div'} className={cx('title')}>
            <Box>Order confirmation</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton
              onClick={props.onClose}
              size={'small'}
              className={cx('close-button')}
              disabled={props.isOnProcess}
            >
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('order-confirmation-body')}>
          <div className={cx('info')}>
            {/* Method: */}
            <div className={cx('field')}>
              <div className={cx('label')}>Method: &nbsp;</div>
              {renderMethodElements(props.data.selectedMethods)}
            </div>

            {/* SOR type: (User SOR | Market SOR)*/}
            {props.data.sorType && (
              <div className={cx('field')}>
                <div className={cx('label')}>SOR type: &nbsp;</div>
                <div className={cx('value')}>
                  {props.data.sorType === SORType.MARKET_SOR ? SORType.MARKET_SOR : SORType.USER_SOR}
                </div>
              </div>
            )}

            {/* Order type: (Limit | Market)*/}
            {props.data.orderType && (
              <div className={cx('field')}>
                <div className={cx('label')}>Order type: &nbsp;</div>
                <div className={cx('value')}>
                  {props.data.orderType === EORDER_TYPE.Limit ? 'Limit order' : 'Market order'}
                </div>
              </div>
            )}

            {/* Buy/Sell token*/}
            {props.data.behaviour && props.data.selectedPair && (
              <div className={cx('field')}>
                <div className={cx('label')}>
                  {props.data.behaviour === Behaviour.BUY && 'Buy'}
                  {props.data.behaviour === Behaviour.SELL && 'Sell'}: &nbsp;
                </div>
                <div className={cx('value')}>{props.data.selectedPair.base_symbol}</div>
              </div>
            )}

            {/* Price*/}
            {props.data.price && (
              <div className={cx('field')}>
                <div className={cx('label')}>Price: &nbsp;</div>
                <div className={cx('value')}>
                  {props.data.price} {props.data.price !== 'Market' && (props.data.selectedPair?.quote_symbol || '')}
                </div>
              </div>
            )}

            {/* Amount*/}
            {props.data.amount && (
              <div className={cx('field')}>
                <div className={cx('label')}>Amount: &nbsp;</div>
                <div className={cx('value')}>
                  {props.data.amount} {props.data.selectedPair?.base_symbol || ''}
                </div>
              </div>
            )}

            {/* Total*/}
            {props.data.total && (
              <div className={cx('field')}>
                <div className={cx('label')}>Total: &nbsp;</div>
                <div className={cx('value')}>
                  {props.data.total} {props.data.selectedPair?.quote_symbol || ''}
                </div>
              </div>
            )}

            {/* First asset amount*/}
            {props.data.firstAmount && (
              <div className={cx('field')}>
                <div className={cx('label')}>First asset amount: &nbsp;</div>
                <div className={cx('value')}>{props.data.firstAmount}</div>
              </div>
            )}

            {/* Second asset amount*/}
            {props.data.secondAmount && (
              <div className={cx('field')}>
                <div className={cx('label')}>Second asset amount: &nbsp;</div>
                <div className={cx('value')}>{props.data.secondAmount}</div>
              </div>
            )}

            {/* Price per unit*/}
            {props.data.pricePerUnit && (
              <div className={cx('field')}>
                <div className={cx('label')}>Price per unit: &nbsp;</div>
                <div className={cx('value')}>{props.data.pricePerUnit}</div>
              </div>
            )}

            {/* Slippage tolerance*/}
            {props.data.slippageTolerance && (
              <div className={cx('field')}>
                <div className={cx('label')}>Slippage tolerance: &nbsp;</div>
                <div className={cx('value')}>{props.data.slippageTolerance}%</div>
              </div>
            )}

            {/* Order duration*/}
            {props.data.duration && (
              <div className={cx('field')}>
                <div className={cx('label')}>Order duration: &nbsp;</div>
                <div className={cx('value')}>
                  {props.data.duration === TimeInForce.GTC && 'Good-til-cancel'}
                  {props.data.duration === TimeInForce.GFD && 'Good-for-day'}
                </div>
              </div>
            )}

            {/* Warp*/}
            {props.data.warp && (
              <div className={cx('field')}>
                <div className={cx('label')}>Order duration: &nbsp;</div>
                <div className={cx('value')}>Warp digital credits back to origin wallet</div>
              </div>
            )}
          </div>

          <div className={cx('functional-group')}>
            <Button
              content={props.submitContent}
              type="primary"
              size="md"
              fullWidth={true}
              onClick={props.onSubmit}
              isLoading={props.isOnProcess}
              isDisabled={props.isOnProcess}
            />

            <ButtonBase className={cx('comeback')} onClick={props.onClose} disabled={props.isOnProcess}>
              Come back to trade module
            </ButtonBase>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default OrderConfirmation;
