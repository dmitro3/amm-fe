import { makeStyles } from '@material-ui/core/styles';

const stylePanigation = makeStyles(() => ({
  pagination: {
    '& .MuiPagination-ul > li:first-child, li:last-child': {
      '& .MuiPaginationItem-page': {
        background: 'transparent',
        color: 'var(--body-text)',
      },
    },
    '& .MuiPagination-ul > li': {
      marginLeft: 2,
      marginRight: 2,
    },
    '& .MuiPagination-ul > li > button': {
      background: 'white',
    },
    '& .Mui-selected': {
      background: 'var(--primary-button-bg) !important',
      color: 'var(--color-white) !important',
    },
    '& .MuiPaginationItem-page': {
      width: 24,
      height: 24,
      borderRadius: 6,
      border: 'none',
      color: 'var(--body-text)',
      background: 'var(--color-slippage-btn)',
      margin: 0,
      minWidth: 0,
      padding: '2px 8px',
    },
    '& .MuiPaginationItem-ellipsis': {
      padding: 0,
      width: 24,
      height: 24,
      minWidth: 0,
      background: 'white',
      borderRadius: 6,
      margin: 0,
      color: 'var(--body-text)',
    },
  },
}));

export default stylePanigation;
