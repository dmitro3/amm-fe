import { FormControl, InputAdornment, IconButton, TextField } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import React, { useState } from 'react';
import styles from './PasswordField.module.scss';
import classnames from 'classnames/bind';

const cx = classnames.bind(styles);
interface PasswordFieldProps {
  password: string;
  setPassword: (password: string) => void;
  className?: string;
  error?: string;
  placeholder?: string;
  onClick?: () => void;
  onBlur?: () => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  password,
  setPassword,
  error,
  className,
  onClick,
  onBlur,
  placeholder,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  return (
    <FormControl fullWidth className={className} variant="outlined">
      <TextField
        error={!!error}
        className={cx('password-field')}
        placeholder={placeholder}
        onBlur={onBlur}
        onClick={onClick}
        variant="outlined"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        helperText={error}
      />
    </FormControl>
  );
};
export default PasswordField;
