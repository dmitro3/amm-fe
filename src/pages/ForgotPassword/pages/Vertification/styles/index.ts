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
  button: {
    background: 'var(--primary-button-bg)',
    marginTop: 48,
    minHeight: 44,
    padding: '12px 36px',
    display: 'flex',
    alignSelf: 'flex-start',
    borderRadius: 12,
    width: '100%',

    '& .MuiButton-label': {
      fontWeight: 500,
      fontSize: 16,
      lineHeight: '20px',
      textTransform: 'none',
    },
  },
}));

export default styles;
