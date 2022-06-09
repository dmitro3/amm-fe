import { FormControl, TextField } from '@material-ui/core';
import React from 'react';

interface EmailFieldProps {
  email: string;
  setEmail: (email: string) => void;
  className?: string;
  error?: string;
  onClick?: () => void;
  onBlur?: () => void;
}
const EmailField: React.FC<EmailFieldProps> = ({
  email,
  setEmail,
  className,
  error,
  onClick,
  onBlur,
}: EmailFieldProps) => {
  return (
    <FormControl fullWidth className={className}>
      <TextField
        variant="outlined"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={!!error}
        helperText={error}
        onClick={onClick}
        onBlur={onBlur}
      />
    </FormControl>
  );
};
export default EmailField;
