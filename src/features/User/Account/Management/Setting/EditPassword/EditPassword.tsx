import React from 'react';
import { FastField, Form, Formik } from 'formik';
import * as yup from 'yup';
import { passwordRegex } from 'src/helpers/user';
import { changePassword } from 'src/features/User/redux/apis';
import { useAppDispatch } from 'src/store/hooks';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import stylesSCSS from 'src/features/User/Account/Management/Setting/styles/EditPassword.module.scss';
import styles from 'src/features/User/Account/Management/Setting/styles';
import InputField from 'src/components/Form/InputField';
import { routeConstants } from 'src/constants';
import Button from '@material-ui/core/Button';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { ChangePassword } from 'src/features/User/interfaces';
const cx = classNames.bind(stylesSCSS);

interface funcProps {
  handleBackToModeView: () => void;
}

const validationSchema = yup.object({
  current_password: yup
    .string()
    .matches(
      passwordRegex,
      'Sorry, your password must be between 8 and 30 characters long with 1 uppercase letter and 1 number.',
    )
    .required('This field is required.'),

  new_password: yup
    .string()
    .matches(
      passwordRegex,
      'Sorry, your password must be between 8 and 30 characters long with 1 uppercase letter and 1 number.',
    )
    .required('This field is required.'),
  confirm_new_password: yup
    .string()
    .matches(
      passwordRegex,
      'Sorry, your password must be between 8 and 30 characters long with 1 uppercase letter and 1 number.',
    )
    .required('This field is required.')
    .oneOf([yup.ref('new_password')], 'These passwords do not match. Try again.'),
});

const initialValues = {
  current_password: '',
  new_password: '',
  confirm_new_password: '',
};

const EditPassword = (props: funcProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const classes = styles();
  return (
    <div className={cx('container')}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (value, { setSubmitting, resetForm, setFieldError }): Promise<void> => {
          setSubmitting(true);
          const { current_password, new_password } = value;
          const body: ChangePassword = {
            currentPassword: current_password,
            newPassword: new_password,
          };
          const res = await dispatch(changePassword(body));
          if (res?.payload?.code === 1) {
            setFieldError('current_password', 'Your password is wrong.');
          }
          if (res?.payload?.code === 0) {
            resetForm();
            dispatch(
              openSnackbar({
                message: 'Password has been changed successfully!',
                variant: SnackbarVariant.SUCCESS,
              }),
            );
            props.handleBackToModeView();
          }
          setSubmitting(false);
        }}
      >
        {(): JSX.Element => {
          return (
            <Form className={classes.form} id="create-form">
              <FastField
                type="password"
                name="current_password"
                component={InputField}
                label="Current Password"
                placeholder="Current Password"
              />
              <FastField
                type="password"
                name="new_password"
                component={InputField}
                label="New Password"
                placeholder="New Password"
              />
              <FastField
                type="password"
                name="confirm_new_password"
                component={InputField}
                label="Confirm New Password"
                placeholder="Confirm New Password"
              />
              <Link className={cx('forgot_password')} to={routeConstants.FORGOT_PASSWORD}>
                Forgot Password
              </Link>
            </Form>
          );
        }}
      </Formik>
      <div className={cx('button')}>
        <Button
          variant="contained"
          color="primary"
          className={cx('button_cancel')}
          onClick={props.handleBackToModeView}
        >
          Cancel
        </Button>
        <Button form="create-form" variant="contained" color="primary" type="submit" className={cx('button_submit')}>
          Save changes
        </Button>
      </div>
    </div>
  );
};

export default EditPassword;
