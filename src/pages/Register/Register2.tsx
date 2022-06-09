import classNames from 'classnames/bind';
import { FastField, Form, Formik, Field, ErrorMessage } from 'formik';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CButton } from 'src/components/Base/Button';
import InputField from 'src/components/Form/InputField';
import SelectField from 'src/components/Form/SelectedField';
import stylesSCSS from 'src/pages/Register/styles/CreateAccount.module.scss';
import { Link } from 'react-router-dom';
import { routeConstants } from 'src/constants';
import {
  companyNameRegex,
  nameRegex,
  passwordRegex,
  phoneNumberRegex,
  emailRegex,
  positionRegex,
} from 'src/helpers/user';
import { getFunctionalCurrency, getRegionCode as getUserRegionCode } from 'src/services/user';
import { useAppDispatch } from 'src/store/hooks';
import * as yup from 'yup';
import styles from './styles';
import SelectFlagCode from 'src/components/SelectFlagCode';
import { data, ICountry } from 'src/constants/country';
import { Box, Typography, TextField } from '@material-ui/core';
import { createUser } from 'src/store/auth';
import { checkValidEmail } from 'src/services/user';
import { Button } from '@material-ui/core';
import WalletAddresses from 'src/pages/Register/Components/WalletAddresses';
import EditIcon from 'src/assets/icon/editIcon.svg';

const TITLE = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Ms.', label: 'Ms.' },
];

const cx = classNames.bind(stylesSCSS);

const Register2: React.FC = () => {
  const classes = styles();
  const dispatch = useAppDispatch();
  const history = useHistory();

  let currentEmail = '';
  let currentEmailState = true;

  const validationSchema = yup.object({
    title: yup.string().min(1, 'This field is required.').required('This field is required.'),
    fullname: yup
      .string()
      .trim()
      .matches(nameRegex, 'Sorry, special characters are not allowed.')
      .required('This field is required.'),
    company: yup
      .string()
      .trim()
      .matches(companyNameRegex, 'Sorry, special characters are not allowed.')
      .required('This field is required.'),
    position: yup
      .string()
      .trim()
      .matches(positionRegex, 'Sorry, numbers and special characters are not allowed.')
      .required('This field is required.'),
    email: yup
      .string()
      .required('This field is required.')
      .matches(emailRegex, 'Please enter a correct email.')
      .test(
        `check-valid-email`,
        'This email is already registered. Try another or reset your password.',
        async function (value) {
          if (value && emailRegex.test(String(value)) && currentEmail != value) {
            currentEmail = value;
            const res = await checkValidEmail(value);

            if (res.code === 0) currentEmailState = true;
            if (res.status_code === 406) currentEmailState = false;
          }

          return currentEmailState;
        },
      ),
    password: yup
      .string()
      .max(30, 'Sorry, your password must be between 8 and 30 characters long with 1 uppercase letter and number.')
      .min(8, 'Sorry, your password must be between 8 and 30 characters long with 1 uppercase letter and number.')
      .matches(
        passwordRegex,
        'Sorry, your password must be between 8 and 30 characters long with 1 uppercase letter and 1 number.',
      )
      .required('This field is required.'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'These passwords do not match. Try again.')
      .matches(
        passwordRegex,
        'Sorry, your password must be between 8 and 30 characters long with 1 uppercase letter and number.',
      )
      .required('This field is required.'),
    phone: yup
      .string()
      .matches(phoneNumberRegex, 'Special character is not displayed.')
      .max(12, 'Sorry, the phone number must be between 9 and 12 numbers only.')
      .min(9, 'Sorry, the phone number must be between 9 and 12 numbers only.')
      .required('This field is required.'),
    functional_currencies: yup
      .array()
      .of(yup.number())
      .min(1, 'This field is required.')
      .required('This field is required.'),
    velo_account: yup.string().matches(emailRegex, 'Please enter a correct email.'),
    wallets: yup
      .array()
      .of(yup.string())
      .test('wallets-required', 'This field is required.', function (value) {
        if (!value || value[0] === '' || value[0] === undefined) return false;
        return true;
      }),
  });

  const initialValues = {
    title: '',
    fullname: '',
    company: '',
    position: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    functional_currencies: [] as number[],
    wallets: [''] as string[],
    velo_account: '',
  };

  const [functionalCurrencyList, setFunctionalCurrencyList] = useState<{ value: number; label: string }[]>();
  const [regionCode, setRegionCode] = useState<ICountry>(data[0]);
  const [openAddWalletDialog, setOpenAddWalletDialog] = useState<boolean>(false);

  const getFunctionalCurrencyList = async () => {
    const res = await getFunctionalCurrency();
    await setFunctionalCurrencyList(
      res?.map((item) => ({
        value: item.id,
        label: item.currency,
      })),
    );
  };

  const getRegionCode = async () => {
    const res = await getUserRegionCode();
    if (res) {
      const userCountry = data.find(
        (country: ICountry) => country.code.toLocaleLowerCase() === res.toLocaleLowerCase(),
      );
      if (userCountry) setRegionCode(userCountry);
    }
  };

  useEffect(() => {
    getFunctionalCurrencyList();
    getRegionCode();
  }, []);

  return (
    <div className={cx('container')}>
      <div className={cx('admin-create')}>
        <Typography variant="h3" className={cx('title')}>
          <Box fontWeight={700}>Registration form</Box>
        </Typography>
        <div className={cx('form-container')}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (value, { setSubmitting, resetForm }): Promise<void> => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { confirmPassword, velo_account, ...rs } = value;
              setSubmitting(true);
              const createUserInfo = velo_account
                ? {
                    ...rs,
                    regionCode: '+' + regionCode.mobileCode,
                    velo_account: velo_account,
                  }
                : {
                    ...rs,
                    regionCode: '+' + regionCode.mobileCode,
                  };

              const res = await dispatch(createUser(createUserInfo));

              if (res.payload?.code === 0) {
                resetForm();
                history.push(`${routeConstants.VERIFY_EMAIL}?email=${value.email}`);
              }

              setSubmitting(false);
            }}
          >
            {(formikProps): JSX.Element => {
              // do something here ...
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { values, errors, touched, isSubmitting } = formikProps;
              return (
                <Form className={classes.form} id="create-form">
                  <FastField
                    name="title"
                    component={SelectField}
                    label="Title"
                    placeholder="Choose your title"
                    options={TITLE}
                    isTextFieldSearchable={false}
                  />

                  <FastField
                    name="fullname"
                    component={InputField}
                    isTrim={true}
                    label="Full name"
                    placeholder="Full name"
                  />

                  <FastField
                    name="company"
                    component={InputField}
                    label="Company/Organization"
                    placeholder="Company/Organization"
                    isTrim={true}
                  />

                  <FastField
                    name="position"
                    component={InputField}
                    isTrim={true}
                    label="Position"
                    placeholder="Position"
                  />

                  <FastField name="email" component={InputField} label="Email" placeholder="Email" maxLength={320} />

                  <label className={cx('label')}>Phone number</label>
                  <div className={cx('phone-container')}>
                    <div className={cx('flag-code-container')}>
                      <SelectFlagCode
                        className={cx('flag-code')}
                        selectedCountry={regionCode}
                        setSelectedCountry={setRegionCode}
                      />
                    </div>
                    <FastField name="phone" isPhoneNumber={true} component={InputField} placeholder="Phone number" />
                  </div>

                  <FastField
                    type="password"
                    name="password"
                    component={InputField}
                    label="Password"
                    placeholder="Password"
                  />

                  <FastField
                    type="password"
                    name="confirmPassword"
                    component={InputField}
                    label="Confirm password"
                    placeholder="Confirm password"
                  />

                  <Field
                    name="functional_currencies"
                    component={SelectField}
                    label="Functional currency"
                    placeholder="Choose your functional currency"
                    options={functionalCurrencyList}
                    isMulti={true}
                    showSearchBar={true}
                    searchPlaceholder="Search functional currency"
                  />

                  <label>Wallet addresses</label>
                  {(values.wallets[0] === '' || values.wallets[0] === undefined) && (
                    <div className={cx('add-wallets')}>
                      <div className={cx('add-wallet-link-container')}>
                        <div className={cx('add-wallet-link')} onClick={() => setOpenAddWalletDialog(true)}>
                          Add wallet addresses
                        </div>
                        <CButton
                          classNamePrefix="add-btn"
                          size="sm"
                          type="primary"
                          content="+"
                          onClick={() => {
                            setOpenAddWalletDialog(true);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {values.wallets[0] !== '' && values.wallets[0] !== undefined && (
                    <div className={cx('wallets-addresses-container')}>
                      <TextField
                        className={cx('wallets-address-show-input')}
                        variant="outlined"
                        disabled={true}
                        value={values.wallets.map((el, index) => {
                          const elTransform = `${el.slice(0, 5)}...${el.slice(el.length - 3, el.length)}`;
                          return index === 0 ? elTransform : `  ${elTransform}`;
                        })}
                      />

                      <div className={cx('add-wallet-addresses-icon')}>
                        <img src={EditIcon} alt="" onClick={() => setOpenAddWalletDialog(true)} />
                      </div>
                    </div>
                  )}

                  <ErrorMessage name="wallets">
                    {(msg) => <div className={cx('wallets-error')}>{msg}</div>}
                  </ErrorMessage>

                  <WalletAddresses
                    open={openAddWalletDialog}
                    setFieldValue={formikProps.setFieldValue}
                    currentValues={formikProps.values.wallets}
                    setOpenAddWalletDialog={setOpenAddWalletDialog}
                  />

                  <FastField
                    name="velo_account"
                    component={InputField}
                    label="Velo dashboard account"
                    placeholder="Velo dashboard account"
                  />
                </Form>
              );
            }}
          </Formik>
        </div>
        <Button form="create-form" variant="contained" color="primary" type="submit" className={classes.button}>
          Register
        </Button>

        <div className={cx('sign-in')}>
          {`Already have an account? `}
          <Link className={cx('sign-in_link')} to={routeConstants.SIGN_IN}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register2;
