import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  form: {
    '& > .MuiFormControl-root': {
      display: 'block',
      width: '400px',
      margin: '0 0 20px 0 !important',

      '& label': {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '20px',
        color: 'var(--color-title-active)',
      },
    },

    '& .MuiInputBase-input': {
      background: 'var(--filter-input-background)',
      // border: '1px solid var(--filter-input-border)',
      borderRadius: 10,
      color: 'var(--placeholder)',
    },

    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  button: {
    background: 'var(--primary-button-bg)',
    marginTop: 30,
    height: 30,
    marginRight: 20,
    display: 'flex',
    alignSelf: 'flex-start',
    borderRadius: 10,
    width: '60%',

    '& .MuiButton-label': {
      fontWeight: 500,
      fontSize: 14,
      lineHeight: '20px',
      textTransform: 'none',
    },
  },

  dialog: {
    '& .MuiDialog-paper': {
      minWidth: 500,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    },
    '& .MuiDialogTitle-root': {
      margin: 0,
      padding: 0,
      marginTop: 30,
    },
    '& .MuiDialogContent-root': {
      margin: 30,
      padding: 0,

      '& .MuiDialogActions-root': {
        padding: 0,
      },
    },
  },
}));

export default styles;
