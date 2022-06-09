import React, { useState } from 'react';
import * as yup from 'yup';
import classNames from 'classnames/bind';
import { FastField, Form, Formik, ErrorMessage } from 'formik';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './styles';
import stylesSCSS from './styles/GetPassToken.module.scss';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';
import InputField from 'src/components/Form/InputField';
import Error from 'src/components/Form/Error';

const cx = classNames.bind(stylesSCSS);

interface GetPassTokenProps {
  onGetPassToken: (email: string) => void;
}

const GetPassToken: React.FC<GetPassTokenProps> = ({ onGetPassToken }) => {
  const classes = styles();

  const [showCaptchaError, setShowCaptcharError] = useState(true);

  const validationSchema = yup.object({
    email: yup.string().required('This field is required.'),
    isVerify: yup.string().required(),
  });

  const initialValues = {
    email: '',
    isVerify: '',
  };

  return (
    <div className={cx('forgot-password')}>
      <div className={cx('form-container')}>
        <Typography variant="h3" className={cx('title')}>
          Forgot your password?
        </Typography>

        <Typography variant="body1" className={cx('sub-title')}>
          Enter the email address you used when you joined and we’ll send you instructions to reset your password.
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (value, { setSubmitting }): Promise<void> => {
            setSubmitting(true);

            const { email } = value;

            await onGetPassToken(email);

            setSubmitting(false);
          }}
        >
          {(formikProps): JSX.Element => {
            const { setFieldValue } = formikProps;
            // do something here ...
            return (
              <>
                <Form className={classes.form} id="get-pass-token-form">
                  <FastField name="email" component={InputField} label="Email" placeholder="Email" />
                </Form>

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
                    component={(): JSX.Element => <Error errorName="Please verify that you are not a robot" />}
                  />
                )}

                <Button
                  form="get-pass-token-form"
                  variant="contained"
                  color="primary"
                  type="submit"
                  className={classes.button}
                >
                  Reset password
                </Button>
              </>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default GetPassToken;
