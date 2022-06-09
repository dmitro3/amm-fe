import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  select: {
    '& .theme-select__control': {
      transition: 'none',
    },

    '& .theme-select__menu': {
      borderRadius: '10px !important',
      overflow: 'hidden',
    },

    '& .theme-select__menu-list': {
      borderRadius: '0px 0px 10px 10px',
    },

    '& .MuiOutlinedInput-root': {
      boxSizing: 'border-box',
      borderRadius: '10px !important',
      overflow: 'hidden',
      background: 'var(--input-background)',
    },

    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none !important',
      outline: 'none !important',
    },

    '& .MuiInputBase-root': {
      minWidth: '100% !important',
    },

    '& .theme-select__option': {
      borderBottom: '1px solid var(--color-border)',
    },
  },
}));

export default styles;
