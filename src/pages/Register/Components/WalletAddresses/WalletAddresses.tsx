import { Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogProps } from '@material-ui/core';
import React from 'react';
import { Formik, FieldArray, FastField, Form } from 'formik';
import classnames from 'classnames/bind';
import styleSCSS from './styles/WalletAddresses.module.scss';
import styles from './styles';
import * as yup from 'yup';
import { walletAddressRegex } from 'src/helpers/user';
import InputField from 'src/components/Form/InputField';
import { CButton } from 'src/components/Base/Button';
import CloseDarkButton from 'src/assets/icon/close-dark.svg';
import { REGISTER_VALIDATE_WALLET_ERROR_MESSAGE } from 'src/constants/errorMsg.message';
import {
  isWalletAddressTrustline,
  isWalletAddressExists,
  isWalletStellarAddressActive,
  checkWalletAddressNetwork,
} from 'src/services/user';
import { Network } from 'src/constants/network';

const cx = classnames.bind(styleSCSS);

type WalletAddressesProps = DialogProps & {
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
  setOpenAddWalletDialog: React.Dispatch<React.SetStateAction<boolean>>;
  currentValues: string[];
};

const WalletAddresses: React.FC<WalletAddressesProps> = ({
  open,
  setFieldValue,
  setOpenAddWalletDialog,
  currentValues,
}) => {
  const classes = styles();

  const initialValues = {
    walletAddresses: [''] as string[],
  };

  if (currentValues.length > 0) initialValues.walletAddresses = currentValues;

  const validationSchema = yup.object({
    walletAddresses: yup.array().of(
      yup
        .string()
        .trim()
        .test(`test-unique-walletAddress`, 'Wallet address can not duplicate.', function (value, ctx) {
          let count = 0;
          ctx.parent.forEach((testValue: string) => {
            if (testValue === value) {
              count++;
            }
          });
          return !(value !== undefined && count > 1);
        })
        .test(`check-wallet-address`, async function (value) {
          if (value) {
            const walletNetwork = await checkWalletAddressNetwork(value);
            if (walletNetwork?.code === 1)
              return this.createError({
                path: this.path,
                message: REGISTER_VALIDATE_WALLET_ERROR_MESSAGE.INVALID_ADDRESS,
              });

            const isExists = await isWalletAddressExists(value);
            if (isExists) {
              return this.createError({
                path: this.path,
                message: REGISTER_VALIDATE_WALLET_ERROR_MESSAGE.ADDRESS_EXISTS,
              });
            }

            if (walletNetwork.data === Network.Stellar) {
              const isActive = await isWalletStellarAddressActive(value);
              if (!isActive) {
                return this.createError({
                  path: this.path,
                  message: REGISTER_VALIDATE_WALLET_ERROR_MESSAGE.ADDRESS_NOT_ACTIVE,
                });
              }

              const isTrustline = await isWalletAddressTrustline(value);
              if (!isTrustline) {
                return this.createError({
                  path: this.path,
                  message: REGISTER_VALIDATE_WALLET_ERROR_MESSAGE.ADDRESS_NOT_TRUSTLINE,
                });
              }
            }
          }

          return true;
        })
        .required('This field is required.'),
    ),
  });

  return (
    <Dialog open={open} aria-labelledby="add-wallets-addresses-dialog" className={classes.dialog}>
      <DialogTitle id="form-dialog-title" className={cx('wallet-dialog-title')}>
        Wallet addresses
      </DialogTitle>
      <span className={cx('icon-container')}>
        <img src={CloseDarkButton} onClick={() => setOpenAddWalletDialog(false)} alt="" />
      </span>

      <DialogContent className={cx('wallets-dialog-content')}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            setFieldValue('wallets', values.walletAddresses);
            setOpenAddWalletDialog(false);
          }}
        >
          {(formikProps) => {
            const { values } = formikProps;

            return (
              <Form className={classes.form} id="add-wallet-addresses-form">
                <FieldArray name="walletAddresses">
                  {(arrayHelpers) => {
                    return (
                      <>
                        {values.walletAddresses.length > 0 &&
                          values.walletAddresses.map((wallet, index) => (
                            <div key={index} className={classes.wallets}>
                              <FastField
                                name={`walletAddresses.${index}`}
                                component={InputField}
                                placeholder="Wallet addresses"
                                isNoSpace={true}
                                regex={walletAddressRegex}
                              />
                              {index === 0 ? (
                                <CButton
                                  classNamePrefix="add-btn"
                                  size="sm"
                                  type="primary"
                                  content="+"
                                  onClick={() => {
                                    if (values.walletAddresses?.every((element) => element !== ''))
                                      arrayHelpers.push('');
                                  }}
                                />
                              ) : (
                                <CButton
                                  classNamePrefix="remove-btn"
                                  size="sm"
                                  type="primary"
                                  content="-"
                                  onClick={() => arrayHelpers.remove(index)}
                                />
                              )}
                            </div>
                          ))}
                      </>
                    );
                  }}
                </FieldArray>
              </Form>
            );
          }}
        </Formik>

        <DialogActions>
          <Button
            className={`${classes.button} ${cx('cancel-button')}`}
            variant="contained"
            color="primary"
            onClick={() => setOpenAddWalletDialog(false)}
          >
            Cancel
          </Button>
          <Button
            form="add-wallet-addresses-form"
            variant="contained"
            color="primary"
            type="submit"
            className={`${classes.button} ${cx('save-button')}`}
          >
            Save
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default WalletAddresses;
