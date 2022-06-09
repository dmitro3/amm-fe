import { Typography } from '@material-ui/core';
import classNames from 'classnames/bind';
import { ErrorMessage, FastField, Form, Formik, FormikProps } from 'formik';
import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, useHistory } from 'react-router-dom';
import Error from 'src/components/Form/Error';
import InputField from 'src/components/Form/InputField';
import { routeConstants } from 'src/constants';
import httpExceptionSubCode from 'src/constants/httpExceptionSubCode';
import ChangePassword from 'src/pages/SignIn/ChangePassword';
import LoginAttemptsExceeded from 'src/pages/SignIn/LoginAttemptsExceeded';
import stylesSCSS from 'src/pages/SignIn/styles/Login.module.scss';
import { postLogin } from 'src/store/auth';
import { useAppDispatch } from 'src/store/hooks';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import * as yup from 'yup';
import { CButton } from 'src/components/Base/Button';
import styles from './styles';

const cx = classNames.bind(stylesSCSS);

const SignIn2: React.FC = () => {
  const [loadingSetting, setLoadingSetting] = React.useState(false);
  const [isShowScreenLock, setIsShowScreenLock] = useState(false);
  const [showCaptchaError, setShowCaptcharError] = useState(true);

  const [changePassword, setChangePassword] = useState(false);
  const [username, setUsername] = useState<string>('');

  const dispatch = useAppDispatch();
  const classes = styles();
  const history = useHistory();

  const validationSchema = yup.object({
    username: yup.string().required('This field is required'),
    password: yup.string().required('This field is required'),
    isVerify: yup.string().required(),
  });

  const initialValues = {
    username: '',
    password: '',
    isVerify: '',
  };
  const refFormik = React.useRef<FormikProps<typeof initialValues>>(null);

  const onSubmitFunc = async (value: any, setSubmitting: (isSubmitting: boolean) => void): Promise<void> => {
    try {
      setSubmitting(true);
      setLoadingSetting(true);
      const res = await dispatch(postLogin(value));
      if (res?.payload?.status_code === 400 && res?.payload?.code === 'INVALID_GOOGLE_CAPTCHA') {
        dispatch(
          openSnackbar({
            message: 'Invalid Captcha.',
            variant: SnackbarVariant.ERROR,
          }),
        );
        return;
      }
      if (res?.payload?.status_code === 403) {
        if (res?.payload?.code === httpExceptionSubCode.FORBIDDEN.LOCK_ACCOUNT) {
          setIsShowScreenLock(true);
          return;
        }

        if (res?.payload?.code === httpExceptionSubCode.FORBIDDEN.USER_EMAIL_NOT_VERIFIED) {
          history.push(`${routeConstants.VERIFY_EMAIL}?email=${value.username}`);
        }

        if (res?.payload?.code === httpExceptionSubCode.FORBIDDEN.ADMIN_NOT_CHANGED_DEFAULT_PASSWORD) {
          setUsername(value.username);
          setChangePassword(true);
          return;
        }
      }
      if (res?.payload.code === 0) {
        history.push(routeConstants.DASHBOARD);
        return;
      }
    } catch (e) {
      // dispatch(
      //   openSnackbar({
      //     message: e.message || e,
      //     variant: SnackbarVariant.ERROR,
      //   }),
      // );
    } finally {
      setSubmitting(false);
      setLoadingSetting(false);
    }
  };

  return (
    <>
      {changePassword && <ChangePassword username={username} setChangePassword={setChangePassword} />}

      {!changePassword && (
        <div className={cx('user-sign-in')}>
          {!isShowScreenLock && (
            <div className={cx('form-container-margin')}>
              <div className={cx('form-container')}>
                <Typography variant="h3" className={cx('title')}>
                  Sign In
                </Typography>

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={async (value, { setSubmitting }): Promise<void> => {
                    await onSubmitFunc(value, setSubmitting);
                  }}
                  innerRef={refFormik}
                >
                  {(formikProps): JSX.Element => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { values, errors, touched, isSubmitting, setFieldValue } = formikProps;

                    return (
                      <>
                        <Form className={classes.form} id="create-form">
                          <FastField name="username" component={InputField} label="Email" placeholder="Email" />

                          <FastField
                            type="password"
                            name="password"
                            component={InputField}
                            label="Password"
                            placeholder="Password"
                          />
                          <Link className={cx('forgot_password')} to={routeConstants.FORGOT_PASSWORD}>
                            Forgot Password
                          </Link>

                          <div className={cx('g-recaptcha')}>
                            <ReCAPTCHA
                              sitekey={process.env.REACT_APP_GOOGLE_RECAPTCHA_SITEKEY || ''}
                              onExpired={() => {
                                setFieldValue('isVerify', '');
                                setShowCaptcharError(false);
                              }}
                              onChange={(v: any) => {
                                setFieldValue('isVerify', v);
                              }}
                            />
                          </div>
                          {showCaptchaError && (
                            <ErrorMessage
                              name="isVerify"
                              component={(): JSX.Element => (
                                <Error errorName="Please verify that you are not a robot" />
                              )}
                            />
                          )}
                        </Form>
                        <div className={cx('btn-signin')}>
                          <CButton
                            size={'md'}
                            type={'primary'}
                            content="Sign In"
                            onClick={() => refFormik.current?.handleSubmit()}
                            isLoading={loadingSetting}
                            isDisabled={loadingSetting}
                            fullWidth={true}
                          />
                        </div>
                      </>
                    );
                  }}
                </Formik>

                <div className={cx('register')}>
                  {`Don't have an account? `}
                  <Link className={cx('register_link')} to={routeConstants.REGISTER}>
                    Register
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isShowScreenLock && <LoginAttemptsExceeded setIsShowScreenLock={setIsShowScreenLock} alt="Locked Account" />}
        </div>
      )}
    </>
  );
};

export default SignIn2;
