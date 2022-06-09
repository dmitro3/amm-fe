import { Fade, Tooltip } from '@material-ui/core';
import React from 'react';

interface ITooltip {
  content: any;
}

const TooltipText: React.FC<ITooltip> = ({ content }) => {
  function get_ellipsis_mid(str: string) {
    if (str && str.length > 15) {
      return str.substr(0, 5) + '...' + str.substr(str.length - 3, str.length);
    }
    return str;
  }

  return (
    <Tooltip TransitionComponent={Fade} title={content} interactive arrow placement="top">
      <span
        style={{ width: '100%', textOverflow: 'ellipsis', overflow: 'hidden', height: 'fit-content', display: 'block' }}
      >
        {get_ellipsis_mid(content)}
      </span>
    </Tooltip>
  );
};

export default TooltipText;
