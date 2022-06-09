import { Button, Typography } from '@material-ui/core';
import { Formik, FastField, Form } from 'formik';
import classNames from 'classnames/bind';
import React from 'react';
import { passwordRegex } from 'src/helpers/user';
import InputField from 'src/components/Form/InputField';
import stylesCSS from './styles/ChangePassword.module.scss';
import * as yup from 'yup';
import styles from './styles/styles';
import { changePasswordFirstLogin } from 'src/services/admin';

const cx = classNames.bind(stylesCSS);

interface ChangePasswordProps {
  username: string;
  setChangePassword: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ username, setChangePassword }) => {
  const classes = styles();

  const initialValues = {
    username,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const validationSchema = yup.object({
    username: yup.string().required('This field is required'),
    currentPassword: yup.string().required('This field is required.'),
    newPassword: yup
      .string()
      .max(30, 'Sorry, your password must be between 8 and 30 characters long with 1 uppercase letter and number.')
      .min(8, 'Sorry, your password must be between 8 and 30 characters long with 1 uppercase letter and number.')
      .notOneOf([yup.ref('currentPassword')], 'Sorry, the new password must be different from the previous password.')
      .matches(
        passwordRegex,
        'Sorry, password need 1 uppercase letter and number and special characters are not allowed.',
      )
      .required('This field is required.'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'These passwords do not match. Try again.')
      .required('This field is required.'),
  });

  return (
    <div className={cx('change-password')}>
      <div className={cx('form-container')}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (value, { setSubmitting }): Promise<void> => {
            setSubmitting(true);

            const changePasswordFirstLoginProps = {
              username: value.username,
              password: value.currentPassword,
              newPassword: value.newPassword,
            };

            const res = await changePasswordFirstLogin(changePasswordFirstLoginProps);

            if (res?.code === 0) {
              setChangePassword(false);
              return;
            }

            setSubmitting(false);
          }}
        >
          {(): JSX.Element => {
            return (
              <Form className={classes.form} id={'change-password-form'}>
                <Typography component="div">
                  <div className={cx('change-password-title')}>Change password</div>
                </Typography>

                <FastField
                  name={'currentPassword'}
                  type={'password'}
                  component={InputField}
                  label={'Current password'}
                  placeholder={'Current password'}
                />

                <FastField
                  name={'newPassword'}
                  type={'password'}
                  component={InputField}
                  label={'New password'}
                  placeholder={'New password'}
                />

                <FastField
                  name={'confirmPassword'}
                  type={'password'}
                  component={InputField}
                  label={'Confirm password'}
                  placeholder={'Confirm password'}
                />

                <Button
                  fullWidth
                  form="change-password-form"
                  variant="contained"
                  color="primary"
                  type="submit"
                  className={classes.button}
                >
                  Change password
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default ChangePassword;
