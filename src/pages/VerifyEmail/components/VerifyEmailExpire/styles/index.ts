import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  button: {
    width: 179.29,
    height: 44,
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
