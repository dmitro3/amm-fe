import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  select: {
    '& .MuiFormControl-root': {
      background: 'var(--color-bg) !important',
    },

    '& .MuiInputBase-input': {
      background: 'var(--color-bg) !important',
    },

    '& .theme-select__control': {
      minHeight: '44px',
      borderRadius: '10px !important',
      background: 'var(--color-bg) !important',
      border: '1px solid var(--color-line) !important',
      transition: 'none',
    },

    '& .theme-select__placeholder': {
      color: 'var(--color-label) !important',
    },

    '& .theme-select__menu': {
      background: 'var(--background-dropdown) !important',
      borderRadius: '10px !important',
      overflow: 'hidden',
      marginTop: '5px !important',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15) !important',

      '& div[class^="SelectField_options"]': {
        margin: 0,
        borderRadius: '0px 0px 10px 10px',
        overflow: 'hidden',
      },
    },

    '& .theme-select__option': {
      background: 'var(--background-dropdown) !important',
      height: 44,
      borderRadius: 0,
      paddingLeft: 16.84,
      paddingRight: 16.84,
      color: 'var(--body-text) !important',

      '&:hover': {
        background: 'var(--color-input-bg) !important',
        color: 'var(--body-text) !important',
      },

      '&:focus': {
        background: 'var(--color-input-bg) !important',
        color: 'var(--body-text) !important',
      },
    },
  },
}));

export default styles;
