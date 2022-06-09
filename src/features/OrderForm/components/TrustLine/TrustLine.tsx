import React, { useEffect, useState } from 'react';
import { TrustLineParam } from 'src/features/OrderForm/interfaces/TrustLineParam';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import { useAppSelector } from 'src/store/hooks';
import { changeTrust, isTrusted } from 'src/features/OrderForm/helpers/trustline/trustline';
import styles from 'src/features/OrderForm/components/TrustLine/TrustLine.module.scss';
import classnames from 'classnames/bind';
import { ButtonBase } from '@material-ui/core';
import CheckSVS from 'src/assets/icon/CheckSVG';
import LoadingSVG from 'src/assets/icon/LoadingSVG';
import AddSVG from 'src/assets/icon/AddSVG';

const cx = classnames.bind(styles);

// TODO: remove trustline
const TrustLine: React.FC = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  const [baseDataState, setBaseDataState] = useState<TrustLineParam | null>(null);
  const [quoteDataState, setQuoteDataState] = useState<TrustLineParam | null>(null);

  const checkTrustLine = async () => {
    if (selectedPair) {
      let path;
      let hardwareWalletType;
      let publicKey;
      if (wallet.trezor.publicKey) {
        path = wallet.trezor.path;
        hardwareWalletType = HardwareWalletType.TREZOR;
        publicKey = wallet.trezor.publicKey;
      } else if (wallet.ledger.publicKey) {
        path = wallet.ledger.path;
        hardwareWalletType = HardwareWalletType.LEDGER;
        publicKey = wallet.ledger.publicKey;
      } else {
        path = null;
        hardwareWalletType = null;
        publicKey = null;
      }

      const baseData: TrustLineParam = {
        symbol: selectedPair.base_symbol,
        issuer: selectedPair.base_stellar_issuer,
        assetType: selectedPair.base_type,
        hardwareWalletType: hardwareWalletType,
        path: path,
        publicKey: publicKey,
        secret: wallet.privateKey,
        isTrust: false,
        isLoading: false,
      };
      const quoteData: TrustLineParam = {
        symbol: selectedPair.quote_symbol,
        issuer: selectedPair.quote_stellar_issuer,
        assetType: selectedPair.quote_type,
        hardwareWalletType: hardwareWalletType,
        path: path,
        publicKey: publicKey,
        secret: wallet.privateKey,
        isTrust: false,
        isLoading: false,
      };
      if (!(await isTrusted(baseData))) {
        setBaseDataState(baseData);
      }
      if (!(await isTrusted(quoteData))) {
        setQuoteDataState(quoteData);
      }
      // console.log(!(await isTrusted(baseData)));
    }
  };

  const trust = async (data: TrustLineParam, side: string): Promise<void> => {
    try {
      if (side === 'base') {
        setBaseDataState({ ...data, isLoading: true });
      } else {
        setQuoteDataState({ ...data, isLoading: true });
      }

      await changeTrust(data);

      if (side === 'base') {
        setBaseDataState({ ...data, isLoading: false, isTrust: true });
      } else {
        setQuoteDataState({ ...data, isLoading: false, isTrust: true });
      }
    } catch (e) {
      // console.log(e);
    }
  };

  useEffect(() => {
    setBaseDataState(null);
    setQuoteDataState(null);
    checkTrustLine();
  }, [selectedPair, wallet]);

  return (
    <>
      {!!(
        (baseDataState || quoteDataState) &&
        (wallet.trezor.publicKey || wallet.ledger.publicKey || wallet.privateKey)
      ) && (
        <div>
          <div className={cx('label')}>To trade, activate these assets on your account:</div>
          {baseDataState && (
            <div className={cx('container')}>
              <div className={cx('info-container')}>
                <div className={cx('logo')}>logo</div>
                <div className={cx('info')}>
                  <div className={cx('name')}>{baseDataState.symbol}</div>
                  <div className={cx('address')}>{baseDataState.issuer}</div>
                </div>
              </div>
              <ButtonBase
                className={cx('accept-btn')}
                disableRipple={true}
                onClick={() => {
                  trust(baseDataState, 'base');
                }}
                disabled={baseDataState.isTrust || baseDataState.isLoading || quoteDataState?.isLoading}
              >
                <div className={cx('icon')}>
                  {!(baseDataState.isLoading || baseDataState.isTrust) && <AddSVG size={'lg'} />}
                  {!baseDataState.isLoading && baseDataState.isTrust && <CheckSVS size={'lg'} />}
                </div>
                {baseDataState.isLoading && !baseDataState.isTrust && (
                  <LoadingSVG size={'lg'} activeColor={'#06C270FF'} />
                )}

                {baseDataState.isTrust ? 'Accepted' : 'Accept'}
              </ButtonBase>
            </div>
          )}

          {quoteDataState && (
            <div className={cx('container')}>
              <div className={cx('info-container')}>
                <div className={cx('logo')}>logo</div>
                <div className={cx('info')}>
                  <div className={cx('name')}>{quoteDataState.symbol}</div>
                  <div className={cx('address')}>{quoteDataState.issuer}</div>
                </div>
              </div>
              <ButtonBase
                className={cx('accept-btn')}
                disableRipple={true}
                onClick={() => {
                  trust(quoteDataState, 'quote');
                }}
                disabled={quoteDataState.isTrust || quoteDataState.isLoading || baseDataState?.isLoading}
              >
                <div className={cx('icon')}>
                  {!(quoteDataState.isLoading || quoteDataState.isTrust) && <AddSVG size={'lg'} />}
                  {!quoteDataState.isLoading && quoteDataState.isTrust && <CheckSVS size={'lg'} />}
                </div>
                {quoteDataState.isLoading && !quoteDataState.isTrust && (
                  <LoadingSVG size={'lg'} activeColor={'#06C270FF'} />
                )}

                {quoteDataState.isTrust ? 'Accepted' : 'Accept'}
              </ButtonBase>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TrustLine;
