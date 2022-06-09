/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import { BigNumber } from 'bignumber.js';
import classnames from 'classnames/bind';
import { ErrorMessage, FastField, FieldArray, FieldArrayRenderProps, Form, Formik, FormikProps } from 'formik';
import mapValues from 'lodash/mapValues';
import React, { useState } from 'react';
import { ReactComponent as ArrowDownIcon } from 'src/assets/icon/Arrow-Down.svg';
import { ReactComponent as DeleteIcon } from 'src/assets/icon/delete2.svg';
import { ReactComponent as PlusIcon } from 'src/assets/icon/plus2.svg';
import { ReactComponent as WarningIcon } from 'src/assets/icon/warning.svg';
import { CButton } from 'src/components/Base/Button';
import InputFieldPool from 'src/pages/PoolRequest/components/InputFieldPool';
import { getCoinsApi } from 'src/helpers/coinHelper/coin.slice';
import { PoolType } from 'src/interfaces/pool';
import WarningPopup from 'src/pages/PoolRequest/components/WarningPopup';
import { postPoolRequest } from 'src/pages/PoolRequest/PoolRequest.slice';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as yup from 'yup';
import AssetSelector from './components/AssetSelector';
import {
  COINS,
  ERROR_MESSAGES,
  FLEXIBLE_POOL_RIGHTS,
  MAX_PERCENTAGE,
  maxDigitsAfterDecimalRegex,
  MIN_PERCENTAGE,
  POOL_TYPE,
  POOL_TYPE_RADIO,
  tokensAddressRegex,
  MAX_WEIGHT,
  MIN_WEIGHT,
  MIN_FEE,
  MAX_FEE,
} from './constants';
import { bnum, isDigitalCreditSelected } from './helpers';
import { ICreatePool, INewPool, Token } from './interfaces';
import stylesSCSS from './PoolRequest.module.scss';
import styles from './styles';
import { useHistory } from 'react-router-dom';
import { routeConstants } from 'src/constants';
import CheckboxImage from 'src/components/Base/CheckboxImage';

const cx = classnames.bind(stylesSCSS);

const PoolRequest: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const tokensList: Token[] = useAppSelector((state) => state.allCoins.coins.data);
  const classes = styles();
  const [curIdx, setCurIdx] = useState(0);
  const [curTokenAddress, setCurTokenAddress] = React.useState('');
  const [refElm, setRefEml] = useState<HTMLButtonElement | null>(null);

  const [weightWarning, setWeightWarning] = React.useState<boolean>(false);
  const [feeWarning, setFeeWarning] = React.useState<boolean>(false);
  const [percentageWarning, setPercentageWarning] = React.useState(false);

  const [popupState, setPopupState] = React.useState({
    open: false,
    success: false,
  });
  const refFormik = React.useRef<FormikProps<INewPool>>(null);

  React.useEffect(() => {
    dispatch(getCoinsApi());
  }, []);

  const initialValues: INewPool = {
    type: POOL_TYPE.FIXED.value,
    tokens: ['token1', 'token2'],
    weights: {
      token1: '',
      token2: '',
    },
    totalWeight: '',
    swapFee: '',
    feeRatioLp: '',
    feeRatioVelo: '',
    rights: {
      canPauseSwapping: false,
      canChangeSwapFee: false,
      canChangeWeights: false,
      canAddRemoveTokens: false,
      canWhitelistLPs: false,
      canChangeCap: false,
    },
  };

  const feeSchema = yup
    .number()
    .required(ERROR_MESSAGES.REQUIRED)
    .test('maxDigitsAfterDecimal', ERROR_MESSAGES.MAX_DIGITS_AFTER_DECIMAL, (number) =>
      maxDigitsAfterDecimalRegex.test(String(number)),
    );

  const validationSchema = yup.object({
    feeRatioLp: feeSchema.test('checkSwapFee', ERROR_MESSAGES.FEE_SUM_ERROR, function (value) {
      return BigNumber.sum(String(value), this.parent.feeRatioVelo).isEqualTo(this.parent.swapFee);
    }),
    feeRatioVelo: feeSchema.test('checkSwapFee', ERROR_MESSAGES.FEE_SUM_ERROR, function (value) {
      return BigNumber.sum(this.parent.feeRatioLp, String(value)).isEqualTo(this.parent.swapFee);
    }),
    swapFee: feeSchema,
    weights: yup.lazy((obj, resolveOptions: any) => {
      const undefinedValidationObject = mapValues(resolveOptions.originalValue, () =>
        feeSchema.min(1, ERROR_MESSAGES.WEIGHT_SMALLER_THAN_1),
      );
      const validationObject: any = mapValues(obj, () => feeSchema.min(1, ERROR_MESSAGES.WEIGHT_SMALLER_THAN_1));

      return yup.object({ ...undefinedValidationObject, ...validationObject });
    }),
    tokens: yup.array().of(yup.string().matches(tokensAddressRegex, ERROR_MESSAGES.REQUIRED)),
    type: yup.boolean(),
    rights: yup
      .object({
        canPauseSwapping: yup.boolean(),
        canChangeSwapFee: yup.boolean(),
        canChangeWeights: yup.boolean(),
        canAddRemoveTokens: yup.boolean(),
        canWhitelistLPs: yup.boolean(),
        canChangeCap: yup.boolean(),
      })
      .when('type', {
        is: true,
        then: yup
          .object()
          .test(
            'atLeastOne',
            ERROR_MESSAGES.REQUIRED,
            (value) =>
              (value.canAddRemoveTokens ||
                value.canChangeCap ||
                value.canChangeSwapFee ||
                value.canChangeWeights ||
                value.canWhitelistLPs ||
                value.canPauseSwapping) as boolean,
          ),
        otherwise: yup.object(),
      }),
  });

  const weightValidation = () => {
    const values = refFormik.current!.values;

    const totalWeight = new BigNumber(values.totalWeight);

    if (totalWeight.lt(MIN_WEIGHT) || totalWeight.gt(MAX_WEIGHT)) {
      setWeightWarning(true);
      return;
    }

    for (const [, weight] of Object.entries(values.weights)) {
      if (!weight) {
        setWeightWarning(false);
        return;
      }
    }

    setWeightWarning(false);
  };

  // const percentageValidation = () => {
  //   const values = refFormik.current!.values;

  //   Object.entries(values.weights).every(([, weight]) => {
  //     const currentPercentage = new BigNumber(weight).div(values.totalWeight).times(100);
  //     return currentPercentage.gte(MIN_PERCENTAGE) && currentPercentage.lte(MAX_PERCENTAGE);
  //   })
  //     ? setPercentageWarning(false)
  //     : setPercentageWarning(true);
  // };

  const percentageValidation = () => {
    const values = refFormik.current!.values;

    for (const [, weight] of Object.entries(values.weights)) {
      if (!weight) {
        setPercentageWarning(false);
        return;
      }
      const currentPercentage = bnum(weight).div(values.totalWeight).times(100);
      if (currentPercentage.gte(MIN_PERCENTAGE) && currentPercentage.lte(MAX_PERCENTAGE)) {
        setPercentageWarning(false);
      } else {
        setPercentageWarning(true);
      }
    }
  };

  const allFeeValidation = () => {
    const values = refFormik.current!.values;

    const swapFee = new BigNumber(values.swapFee);

    if (swapFee.lt(MIN_FEE) || swapFee.gt(MAX_FEE)) {
      setFeeWarning(true);
      return;
    }

    setFeeWarning(false);
  };

  const getTokenDetail = (tokenAddress: string) => {
    return tokensList.find((element) => element.bsc_address === tokenAddress);
  };

  const setTotalWeight = () => {
    refFormik.current?.setFieldValue(
      'totalWeight',
      refFormik.current.values.tokens
        .reduce((acc, tokenAddress) => {
          return acc + Number(refFormik.current?.values.weights[tokenAddress]);
        }, 0)
        .toString(),
    );
  };

  const getPercentage = (tokenAddress: string, values: typeof initialValues) => {
    return Number(values.totalWeight) === 0 || Number.isNaN(Number(values.totalWeight))
      ? 0
      : ((Number(values.weights[tokenAddress]) / Number(values.totalWeight)) * 100).toFixed(2);
  };

  let boundArrayHelpers: FieldArrayRenderProps;

  const bindArrayHelpers = (arrayHelpers: FieldArrayRenderProps) => {
    boundArrayHelpers = arrayHelpers;
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('title')}>Request new pool</div>

      {percentageWarning && (
        <div className={cx('warning')}>
          <WarningIcon />
          <div>Sorry, the weight range is limited from 4% to 96%</div>
        </div>
      )}

      {weightWarning && (
        <div className={cx('warning')}>
          <WarningIcon />
          <div>Total weight must be between 1 and 50</div>
        </div>
      )}

      {feeWarning && (
        <div className={cx('warning')}>
          <WarningIcon />
          <div>Swap fee has to be bigger than 0.01% and smaller than 100%</div>
        </div>
      )}

      <WarningPopup
        success={popupState.success}
        open={popupState.open}
        handleClose={() => {
          setPopupState((state) => ({ ...state, open: false }));
          history.push(routeConstants.POOLS_LIST);
        }}
      />

      <div className={cx('body')}>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            if (percentageWarning || weightWarning || feeWarning) {
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
              return;
            }

            setSubmitting(true);

            const body: ICreatePool = {
              type: values.type === POOL_TYPE.FIXED.value ? PoolType.Fixed : PoolType.Flexible,
              coin_ids: tokensList
                .filter((token) => values.tokens.includes(token.bsc_address))
                .map((token) => token.id),
              weight: values.tokens.map((tokenAddress) => values.weights[tokenAddress]),
              swap_fee: values.swapFee,
              fee_ratio_velo: values.feeRatioVelo,
              fee_ratio_lp: values.feeRatioLp,
              flex_right_config: values.type === POOL_TYPE.FIXED.value ? undefined : JSON.stringify(values.rights),
            };
            const res = await dispatch(postPoolRequest(body));

            if (res.payload.status_code === 400 && res.payload.code === 'MaxPendingPoolCreated') {
              setPopupState({ open: true, success: false });
            } else {
              setPopupState({ open: true, success: true });
            }

            resetForm();
            setSubmitting(false);
          }}
          validationSchema={validationSchema}
          innerRef={refFormik}
        >
          {({ values, setFieldValue, isSubmitting, setErrors, setFieldTouched }) => (
            <Form className={classes.form}>
              <div className={cx('pool-types')}>
                <div className={cx('sub-title')}>Pool type</div>
                <div className={cx('radio-pool-types')}>
                  <RadioGroup
                    value={values.type}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('type', event.target.value === 'true');
                    }}
                  >
                    <FormControlLabel
                      value={POOL_TYPE_RADIO.FIXED.value}
                      control={
                        <Radio
                          disableRipple
                          icon={<span className={classes.icon} />}
                          checkedIcon={<span className={cx(classes.icon, classes.checkedIcon)} />}
                        />
                      }
                      label={POOL_TYPE_RADIO.FIXED.label}
                    />
                    <FormControlLabel
                      value={POOL_TYPE_RADIO.FLEXIBLE.value}
                      control={
                        <Radio
                          disableRipple
                          icon={<span className={classes.icon} />}
                          checkedIcon={<span className={cx(classes.icon, classes.checkedIcon)} />}
                        />
                      }
                      label={POOL_TYPE_RADIO.FLEXIBLE.label}
                    />
                  </RadioGroup>
                </div>
              </div>

              <div className={cx('digital-credit')}>
                <FieldArray name="tokens">
                  {(arrayHelpers) => {
                    bindArrayHelpers(arrayHelpers);

                    return (
                      <table>
                        <thead>
                          <tr>
                            <th className={cx('digital-credits-th')}>Digital credits</th>

                            <th className={cx('weight-th')}>Weight</th>
                            <th className={cx('percent-th')}></th>

                            <th
                              className={cx('add-th')}
                              onClick={async () => {
                                const length = values.tokens.length;

                                if (length < 8) {
                                  let isAllDigitalCreditSelected = true;

                                  values.tokens.forEach((tokenAddress, tokenIndex) => {
                                    if (!isDigitalCreditSelected(tokenAddress)) {
                                      isAllDigitalCreditSelected = false;
                                      setFieldTouched(`tokens[${tokenIndex}]`, true, true);
                                    }
                                  });

                                  if (isAllDigitalCreditSelected) {
                                    const tempTokenKey = await String(new Date().getTime());
                                    arrayHelpers.push(tempTokenKey);
                                    setFieldValue(`weights.${tempTokenKey}`, '');
                                    setFieldValue(`amounts.${tempTokenKey}`, '');
                                    setErrors({});
                                  }
                                }
                              }}
                            >
                              <div className={values.tokens.length < 8 ? undefined : cx('transparent')}>
                                <PlusIcon />
                                Add digital credit
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {values.tokens.length > 0 &&
                            values.tokens.map((tokenAddress, index) => {
                              const tokenDetail = getTokenDetail(tokenAddress);

                              return (
                                <tr
                                  key={tokenAddress === '' ? index : tokenAddress}
                                  className={cx('asset', 'asset-digital-credit')}
                                >
                                  <td className={cx('digital-credits-td')}>
                                    <div>
                                      <Button
                                        endIcon={<ArrowDownIcon />}
                                        onClick={(event) => {
                                          setCurIdx(index);
                                          setCurTokenAddress(tokenAddress);
                                          setRefEml(event.currentTarget);
                                        }}
                                      >
                                        {!isDigitalCreditSelected(tokenAddress) ? (
                                          <div>Choose digital credit</div>
                                        ) : (
                                          <>
                                            <img
                                              width="25px"
                                              height="25px"
                                              src={COINS[tokenDetail?.symbol as keyof typeof COINS].logo}
                                            />
                                            <div>{tokenDetail?.symbol}</div>
                                          </>
                                        )}
                                      </Button>
                                      <ErrorMessage className={cx('error')} component="div" name={`tokens[${index}]`} />
                                    </div>
                                  </td>
                                  <td className={cx('weight-td')}>
                                    <FastField
                                      placeholder="Weights"
                                      name={`weights.${tokenAddress}`}
                                      component={InputFieldPool}
                                      limitDigitAfterPeriod
                                      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                                        await setFieldValue(`weights.${tokenAddress}`, event.target.value);
                                        await setTotalWeight();
                                        await weightValidation();
                                        await percentageValidation();
                                      }}
                                      onClick={() => {
                                        setFieldTouched(`tokens[${index}]`, true, true);
                                      }}
                                    />
                                  </td>
                                  <td className={cx('percent-td')}>{`Percent: ${getPercentage(
                                    tokenAddress,
                                    values,
                                  )}%`}</td>

                                  <td className={cx('add-td')}>
                                    <div>
                                      {values.tokens.length > 2 && (
                                        <DeleteIcon
                                          onClick={() => {
                                            setFieldValue(`weights.${tokenAddress}`, undefined);
                                            arrayHelpers.remove(index);
                                          }}
                                        />
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    );
                  }}
                </FieldArray>
              </div>

              <div className={cx('swap-fee')}>
                <div className={cx('sub-title')}>Swap fee (%)</div>
                <div className={cx('input-swap-fee')}>
                  <FastField
                    placeholder="0.00"
                    name="swapFee"
                    limitDigitAfterPeriod
                    component={InputFieldPool}
                    onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                      await setFieldValue('swapFee', event.target.value);
                      await allFeeValidation();
                    }}
                  />
                </div>
              </div>

              <div className={cx('swap-fee-ratio')}>
                <div className={cx('sub-title')}>Swap fee ratio (%)</div>
                <div>
                  <div className={cx('input-wrapper')}>
                    <div className={cx('label')}>Velo admin</div>
                    <FastField
                      placeholder="0.00"
                      name="feeRatioVelo"
                      limitDigitAfterPeriod
                      component={InputFieldPool}
                      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                        await setFieldValue('feeRatioVelo', event.target.value);
                        await allFeeValidation();
                      }}
                    />
                  </div>
                  <div className={cx('input-wrapper')}>
                    <div className={cx('label')}>Liquidity provider</div>
                    <FastField
                      placeholder="0.00"
                      name="feeRatioLp"
                      limitDigitAfterPeriod
                      component={InputFieldPool}
                      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                        await setFieldValue('feeRatioLp', event.target.value);
                        await allFeeValidation();
                      }}
                    />
                  </div>
                </div>
              </div>

              {values.type === POOL_TYPE.FLEXIBLE.value && (
                <div className={cx('rights')}>
                  <div className={cx('sub-title')}>Rights</div>
                  {Object.entries(values.rights).map(([rightName, value]) => {
                    return (
                      <div key={rightName} className={cx('option-wrapper')}>
                        <CheckboxImage
                          size="md"
                          checked={value}
                          onClick={(value) => setFieldValue(`rights.${rightName}`, value)}
                          label={FLEXIBLE_POOL_RIGHTS[rightName]}
                        />
                      </div>
                    );
                  })}
                  <ErrorMessage className={cx('error')} component="div" name="rights" />
                </div>
              )}

              <div className={cx('action-buttons')}>
                <CButton
                  isDisabled={isSubmitting}
                  type="success"
                  size="md"
                  actionType="submit"
                  content={!isSubmitting ? 'Submit' : 'Submitting...'}
                />

                <CButton
                  type="secondary"
                  size="md"
                  actionType="button"
                  content="Cancel"
                  onClick={() => history.push(routeConstants.POOLS_LIST)}
                />
              </div>
              <AssetSelector
                refElm={refElm}
                open={Boolean(refElm)}
                handleClose={() => setRefEml(null)}
                assets={tokensList.filter((item) => !values.tokens.includes(item.bsc_address))}
                onSelectAsset={async (asset: Token) => {
                  setRefEml(null);
                  await setFieldValue(`weights.${asset.bsc_address}`, values.weights[curTokenAddress]);
                  await boundArrayHelpers.replace(curIdx, asset.bsc_address);
                  await setFieldValue(`weights.${curTokenAddress}`, undefined);
                  await setErrors({});
                  await setFieldTouched(`tokens[${curIdx}]`, false, true);
                }}
              />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PoolRequest;
