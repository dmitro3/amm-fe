import { TextField, TextFieldProps } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import classnames from 'classnames/bind';
import { ErrorMessage, FieldProps, getIn } from 'formik';
import React, { useState } from 'react';
import showPassDark from 'src/assets/icon/showPassDark.svg';
import hidePassDark from 'src/assets/icon/hidePassDark.svg';
import hidePassLight from 'src/assets/icon/hidePassLight.svg';
import showPassLight from 'src/assets/icon/showPassLight.svg';
import Error from 'src/components/Form/Error';
import styles from './InputField.module.scss';
import { phoneNumberRegex, walletAddressRegex } from 'src/helpers/user';
import { useAppSelector } from 'src/store/hooks';
import { THEME_MODE } from 'src/interfaces/theme';

const cx = classnames.bind(styles);

type InputFieldProps = FieldProps &
  TextFieldProps & {
    maxLength?: number;
    isPhoneNumber?: boolean;
    isAddress?: boolean;
    isTrim?: boolean;
    isNoSpace?: boolean;
    regex?: RegExp;
    isInteger?: boolean;
  };

const InputField: React.FC<InputFieldProps> = (props) => {
  const {
    field,
    form,
    type,
    label,
    placeholder,
    disabled,
    maxLength,
    isPhoneNumber = false,
    isAddress = false,
    isTrim = false,
    isNoSpace = false,
    regex = undefined,
    isInteger = false,
    onChange,
    onClick,
  } = props;
  const { name } = field;
  const { errors, touched } = form;
  const errorsDetail = getIn(errors, name);
  const touchedDetail = getIn(touched, name);
  const showError = Boolean(errorsDetail && touchedDetail);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const theme = useAppSelector((state) => state.theme.themeMode);

  const handleOnChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    event.preventDefault();

    const newValue = event.target.value;

    if (isInteger && !/^[0-9]*$/.test(event.target.value)) return;

    if (isPhoneNumber && !event.target.value.match(phoneNumberRegex)) return;
    if (isAddress && !event.target.value.match(walletAddressRegex)) return; // block space, special character

    if (isTrim) if (!form.values[name] && !newValue.replace(/\s/g, '').length) return;

    if (isNoSpace && newValue.includes(' ')) return;

    if (regex && !regex.test(newValue)) return;

    form.setFieldValue(name, newValue);
  };

  return (
    <FormControl className={cx('input-field')}>
      {label && (
        <label className={cx('label')} htmlFor={name}>
          {label}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        <TextField
          className={cx('form-input', showError ? 'error' : 'normal')}
          id={name}
          error={showError}
          variant="outlined"
          {...field}
          type={type === 'password' && showPassword ? 'text' : type}
          disabled={disabled}
          placeholder={placeholder}
          inputProps={{ maxLength }}
          onBlur={(event) => {
            if (isTrim) form.setFieldValue(name, event.target.value.trim());
            // trimed value here, at this moment are only used by the Field, not saved to the Formik value

            form.handleBlur(event);
          }}
          onChange={type === 'number' ? onChange : handleOnChange}
          onWheel={type === 'number' ? (event) => (event.target as HTMLInputElement).blur() : undefined}
          onKeyDown={
            type === 'number' ? (evt) => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault() : undefined
          }
          onClick={onClick}
        />
        {type === 'password' && (
          <div
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: 10, top: '30%', cursor: 'pointer' }}
          >
            <img
              width={25}
              height={18}
              src={
                theme === THEME_MODE.LIGHT
                  ? !showPassword
                    ? showPassLight
                    : hidePassLight
                  : !showPassword
                  ? showPassDark
                  : hidePassDark
              }
              alt=""
            />
          </div>
        )}
      </div>

      <ErrorMessage name={name} component={(): JSX.Element => <Error errorName={errorsDetail} />} />
    </FormControl>
  );
};

export default InputField;
