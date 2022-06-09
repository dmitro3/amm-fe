import { createMuiTheme, TextField, ThemeProvider, withStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React, { KeyboardEvent, useRef, useState } from 'react';
import { THEME_MODE } from 'src/interfaces/theme';

const style = {
  border: 'var(--color-line)',
  bg: 'var(--pool-search)',
  color: 'var(--color-placeholder)',
};

const CustomTextField = withStyles({
  root: {
    margin: 'unset',
    marginLeft: '15px',
    fontSize: '12px',
    '& .MuiAutocomplete-inputRoot': {
      padding: '0 8px',
      '&:disabled': {
        opacity: '0.7',
      },
    },
    '& .MuiOutlinedInput-root': {
      width: '250px',
      borderRadius: '10px',
      background: style.bg,
      height: '36px',
      padding: '7.5px',
      border: '1px solid var(--color-line)',

      '& input': {
        paddingLeft: '5px',
        fontSize: '13px',
        color: 'var(--title-active)',
        '&::placeholder': {
          fontSize: '14px',
          color: style.color,
          opacity: 1,
        },
      },
      '& .MuiSvgIcon-root': {
        fill: style.color,
        margin: 'unset',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .Mui-focused': {
      border: '1px solid var(--color-primary)',
    },
  },
})(TextField);

const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
  },
});

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

interface SearchProps {
  setSearchToken: (t: string) => void;
  setErrorMessage?: (s: string) => void;
  theme: string;
}

const PoolSearch: React.FC<SearchProps> = ({ ...props }) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLDivElement>();

  const handleInput = (e: KeyboardEvent<HTMLDivElement>, val: string) => {
    props.setSearchToken(val);
  };

  return (
    <ThemeProvider theme={props.theme == THEME_MODE.LIGHT ? lightTheme : darkTheme}>
      <CustomTextField
        inputRef={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Pool address"
        margin="normal"
        variant="outlined"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleInput(e, value);
          }
        }}
        InputProps={{
          startAdornment: <SearchIcon />,
          endAdornment: <></>,
        }}
      />
    </ThemeProvider>
  );
};

export default PoolSearch;
