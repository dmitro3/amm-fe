import { createMuiTheme, TextField, ThemeProvider, withStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Autocomplete } from '@material-ui/lab';
import { matchSorter } from 'match-sorter';
import React, { KeyboardEvent, useRef, useState } from 'react';
import { THEME_MODE } from 'src/interfaces/theme';
import { TokenIcon } from '../helpers/TokenIcon';

const style = {
  border: 'var(--color-line)',
  bg: 'var(--pool-search)',
  color: 'var(--color-placeholder)',
};

const CustomTextField = withStyles({
  root: {
    margin: 'unset',
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
      border: '1px solid var(--color-line)',

      '& input': {
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
  data: Array<SearchTokenProps>;
  setSearchToken: (t: string) => void;
  setErrorMessage?: (s: string) => void;
  theme: string;
}

export interface SearchTokenProps {
  symbol: string;
  address: string;
}

const TokenSearch: React.FC<SearchProps> = ({ ...props }) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLDivElement>();
  const filterOptions = (options: SearchTokenProps[], { inputValue }: { inputValue: string }) =>
    matchSorter(options, inputValue, {
      keys: ['symbol', { threshold: matchSorter.rankings.EQUAL, key: 'address' }],
    });
  const handleSelectToken = (val: SearchTokenProps | null) => {
    if (val != null) {
      props.setSearchToken(val.address);
    }
  };

  const handleInput = (e: KeyboardEvent<HTMLDivElement>, val: string) => {
    if (val == '') {
      ref.current?.blur();
      props.setSearchToken(value);
    }
  };

  return (
    <ThemeProvider theme={props.theme == THEME_MODE.LIGHT ? lightTheme : darkTheme}>
      <Autocomplete
        options={props.data || []}
        blurOnSelect={true}
        onChange={(event, value) => handleSelectToken(value)}
        getOptionLabel={(option) => option.symbol || ''}
        getOptionSelected={(option, value) => option.symbol === value.symbol}
        filterOptions={filterOptions}
        renderOption={(option: SearchTokenProps) => (
          <>
            <TokenIcon name={option.symbol} size={36} />
            <div style={{ marginLeft: '10px' }}>
              <div>{option.symbol}</div>
            </div>
          </>
        )}
        noOptionsText={'Not found'}
        renderInput={(params) => (
          <CustomTextField
            {...params}
            inputRef={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search digital credits"
            margin="normal"
            variant="outlined"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleInput(e, value);
              }
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon />,
              endAdornment: <></>,
            }}
          />
        )}
      />
    </ThemeProvider>
  );
};

export default TokenSearch;
