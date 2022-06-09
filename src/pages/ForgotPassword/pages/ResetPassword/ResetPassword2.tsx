import React from 'react';
import * as yup from 'yup';
import classNames from 'classnames/bind';
import { FastField, Form, Formik } from 'formik';
import { useHistory } from 'react-router';
import styles from './styles';
import stylesSCSS from './styles/ResetPassword.module.scss';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';
import { passwordRegex } from 'src/helpers/user';
import InputField from 'src/components/Form/InputField';
import { changePassword } from 'src/store/auth';
import { useAppDispatch } from 'src/store/hooks';
import routeConstants from 'src/constants/routeConstants';

const cx = classNames.bind(stylesSCSS);

interface ResetPasswordProps {
  token: string;
  email: string;
}

const ResetPassword2: React.FC<ResetPasswordProps> = ({ token, email }) => {
  const dispatch = useAppDispatch();

  const classes = styles();
  const history = useHistory();

  const validationSchema = yup.object({
    newPassword: yup
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
      .oneOf([yup.ref('newPassword'), null], 'These passwords don’t match. Try again.')
      .required('This field is required.'),
  });

  const initialValues = {
    prevPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  return (
    <div className={cx('reset-password')}>
      <div className={cx('form-container-margin')}>
        <div className={cx('form-container')}>
          <Typography className={cx('title')}>Reset password</Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (value, { setSubmitting }): Promise<void> => {
              setSubmitting(true);

              const res = await dispatch(changePassword({ email, token, password: value.newPassword }));

              if (res.payload.code === 0) {
                history.push(routeConstants.SIGN_IN);
              }

              setSubmitting(false);
            }}
          >
            {(): JSX.Element => {
              // do something here ...
              return (
                <>
                  <Form className={classes.form} id="get-pass-token-form">
                    <FastField
                      type="password"
                      name="newPassword"
                      component={InputField}
                      label="New password"
                      placeholder="New password"
                    />

                    <FastField
                      type="password"
                      name="confirmPassword"
                      component={InputField}
                      label="Confirm Password"
                      placeholder="Confirm password"
                    />
                  </Form>

                  <div className={cx('submit-button')}>
                    <Button
                      form="get-pass-token-form"
                      variant="contained"
                      color="primary"
                      type="submit"
                      className={classes.button}
                    >
                      Submit
                    </Button>
                  </div>
                </>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword2;
