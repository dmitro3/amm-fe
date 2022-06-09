import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles(() => ({
  switch_base: {
    '&.MuiSwitch-root': {},
    '&.MuiIconButton-label': {
      backgroundColor: 'red',
      span: {
        backgroundColor: 'white',
      },
    },
  },
}));

export default useStyles;
