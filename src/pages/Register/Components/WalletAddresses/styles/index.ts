import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  form: {
    '& > .MuiFormControl-root': {
      margin: '0 0 30px 0 !important',

      '& label': {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '20px',
        color: 'var(--color-body)',
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
  dialog: {
    '& .MuiDialog-paper': {
      width: 578,
      padding: 0,

      '& .MuiDialogTitle-root': {
        padding: 0,

        '& .MuiTypography-root': {
          marginTop: 30,
          marginBottom: 30,
        },
      },

      '& .MuiDialogContent-root': {
        padding: '0px 30px 0px 30px',
      },

      '& .MuiDialogActions-root': {
        padding: 0,
        marginBottom: 30,
        marginTop: 30,
        display: 'flex',
        justifyContent: 'center',
      },
    },
  },
  wallets: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: 20,

    '& > .MuiFormControl-root': {
      width: '100%',
    },

    '& button': {
      marginTop: '12px !important',
      marginLeft: '10px',
      width: '20px !important',
      height: '20px !important',
      minWidth: '0 !important',
      borderRadius: '5px !important',
      fontWeight: '800 !important',
      fontSize: '16px !important',
      color: 'var(--color-bg) !important',
    },
    '& .add-btn': {
      background: 'var(--color-success) !important',
    },
    '& .remove-btn': {
      background: 'var(--color-error) !important',
    },
  },
  button: {
    width: 207.63,
    height: 44,
    padding: '12px 36px',
    display: 'flex',
    alignSelf: 'flex-start',
    borderRadius: 12,

    '& .MuiButton-label': {
      fontWeight: 500,
      fontSize: 16,
      lineHeight: '20px',
      textTransform: 'none',
    },
  },
}));

export default styles;
