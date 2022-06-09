import { TextField, TextFieldProps } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import classnames from 'classnames/bind';
import { ErrorMessage, FieldProps, getIn } from 'formik';
import React from 'react';
import Error from 'src/components/Form/Error';
import { maxDigitsAfterDecimalRegex, numberRegex } from 'src/pages/PoolRequest/constants';
import styles from './InputFieldPool.module.scss';

const cx = classnames.bind(styles);

type InputFieldProps = FieldProps &
  TextFieldProps & {
    limitDigitAfterPeriod?: boolean;
  };

const InputFieldPool: React.FC<InputFieldProps> = (props) => {
  const { field, form, type, label, placeholder, disabled, onChange, onClick, limitDigitAfterPeriod = false } = props;
  const { name } = field;
  const { errors, touched } = form;
  const errorsDetail = getIn(errors, name);
  const touchedDetail = getIn(touched, name);
  const showError = Boolean(errorsDetail && touchedDetail);

  return (
    <FormControl className={cx('input-field')}>
      {label && (
        <label className={cx('label')} htmlFor={name}>
          {label}
        </label>
      )}

      <div className={cx('password-field-container')}>
        <TextField
          className={cx('form-input', showError ? 'error' : 'normal')}
          id={name}
          error={showError}
          variant="outlined"
          {...field}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (limitDigitAfterPeriod) {
              if (maxDigitsAfterDecimalRegex.test(event.target.value)) {
                onChange && onChange(event);
              }
            } else if (numberRegex.test(event.target.value)) onChange && onChange(event);
          }}
          onWheel={type === 'number' ? (event) => (event.target as HTMLInputElement).blur() : undefined}
          onKeyDown={
            type === 'number' ? (evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault() : undefined
          }
          onClick={onClick}
          onPaste={(e) => e.preventDefault()}
        />
      </div>

      <ErrorMessage name={name} component={(): JSX.Element => <Error errorName={errorsDetail} />} />
    </FormControl>
  );
};

export default InputFieldPool;
