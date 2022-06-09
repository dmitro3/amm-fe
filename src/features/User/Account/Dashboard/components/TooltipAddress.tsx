import { Tooltip } from '@material-ui/core';
import React from 'react';

interface Props {
  children: React.ReactElement<any, any>;
  title: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal;
}

export const TooltipAddress: React.FC<Props> = ({ children, title }) => {
  return (
    <Tooltip arrow interactive placement="top" title={title}>
      {children}
    </Tooltip>
  );
};
