import { withStyles } from '@material-ui/core';
import { DataGrid, GridOverlay } from '@material-ui/data-grid';
import React from 'react';
import CLoading from 'src/components/Loading';

const CustomDataGrid = withStyles((theme) => ({
  root: {
    font: 'Roboto',
    fontSize: '12px',
    border: 0,
    color: theme.palette.type === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,.85)',
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    WebkitFontSmoothing: 'auto',
    letterSpacing: 'normal',
    scrollbarColor: '#828282 var(--bg-scroll-ff) !important',
    '& .MuiDataGrid-columnsContainer': {
      backgroundColor: theme.palette.type === 'light' ? '#fafafa' : '#2a2c33',
      borderRadius: '10px 10px 0 0',
      color: 'white',
      borderBottom: `1px solid ${theme.palette.type === 'light' ? '#e0e0e0' : '#333333'}`,
    },
    '& .MuiDataGrid-iconSeparator': {
      display: 'none',
    },
    '& .MuiDataGrid-columnHeaderWrapper': {
      fontSize: '14px',
    },
    '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
      color: theme.palette.type === 'light' ? '#a0a3bd' : 'rgba(255,255,255,0.65)',
    },
    '& .MuiDataGrid-columnHeader': {
      '&:focus': {
        outline: 'none',
      },
    },
    '& .MuiDataGrid-columnHeaderMoving': {
      backgroundColor: 'unset',
    },
    '& .MuiDataGrid-columnHeader-dropZone .MuiDataGrid-columnHeader-draggable': {
      cursor: 'unset',
    },
    '& .MuiDataGrid-columnsContainer .MuiDataGrid-columnHeaderTitleContainer': {
      padding: 0,
    },
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center',
      lineHeight: 'unset !important',
      maxHeight: 'none !important',
      whiteSpace: 'normal',
      color: theme.palette.type === 'light' ? '#4e4b66' : '#ffffff',
      backgroundColor: theme.palette.type === 'light' ? '#fafafa' : '#2a2c33',
      borderBottom: `1px solid ${theme.palette.type === 'light' ? '#e0e0e0' : '#333333'}`,
      '&:focus': {
        outline: 'none',
      },
    },
    '& .MuiDataGrid-renderingZone': {
      maxHeight: 'none !important',
    },
    '& .MuiDataGrid-row': {
      maxHeight: 'none !important',
    },
    '& .MuiDataGrid-row:last-child': {
      '& .MuiDataGrid-cell': {
        border: 'none',
        '& :first-child': {
          // borderBottomLeftRadius: '10px',
        },
        '& :last-child': {
          // borderBottomRightRadius: '10px',
        },
      },
    },
    '& .MuiDataGrid-window': {
      backgroundColor: theme.palette.type === 'light' ? '#fafafa' : '#2a2c33',
      borderRadius: '0 0 10px 10px',
      scrollbarWidth: '5px !important',
    },
    '& .MuiDataGrid-overlay': {
      zIndex: 1,
      color: theme.palette.type === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.85)',
      backgroundColor: theme.palette.type === 'light' ? '#fafafa' : '#2a2c33',
      top: '44px',
      borderRadius: '10px',
    },
  },
}))(DataGrid);

interface NoRowsProps {
  text?: string;
}

export const NoRows: React.FC<NoRowsProps> = ({ text }) => {
  return <span className="MuiDataGrid-overlay">{text || 'No records'}</span>;
};

export const CustomLoadingOverlay: React.FC<{
  type: 'text' | 'spin';
  size: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary';
}> = ({ type = 'spin', size = 'md', color = 'primary' }) => {
  return (
    <GridOverlay>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--datagrid-backgroundColor)',
          cursor: 'default',
          pointerEvents: 'none',
        }}
      >
        <CLoading type={type} size={size} color={color} />
      </div>
    </GridOverlay>
  );
};

export default CustomDataGrid;
