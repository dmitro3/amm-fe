import React, { ReactNode } from 'react';
import classnames from 'classnames/bind';
import styles from './Button.module.scss';
import LoadingSVG from 'src/assets/icon/LoadingSVG';

const cx = classnames.bind(styles);
interface Props {
  size: 'lg' | 'md' | 'sm' | 'xs';
  type: 'primary' | 'secondary' | 'subtle' | 'text' | 'success' | 'error';
  isLoading?: boolean;
  isDisabled?: boolean;
  prepend?: ReactNode;
  content?: string;
  onClick?: () => void;
  classNamePrefix?: string;
  actionType?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}
const CButton: React.FC<Props> = ({
  prepend,
  content = 'Button',
  size = 'lg',
  type = 'primary',
  isDisabled = false,
  isLoading,
  onClick,
  classNamePrefix,
  actionType = 'button',
  fullWidth = false,
}) => {
  return (
    <button
      disabled={isLoading || isDisabled}
      onClick={() => {
        if (!isLoading && typeof onClick === 'function') {
          onClick();
        }
      }}
      type={actionType}
      className={cx(
        'theme-btn',
        `theme-btn-${size}`,
        `theme-btn-${type}`,
        `${classNamePrefix}`,
        `${fullWidth ? 'full-witdh' : ''}`,
        `${isDisabled ? `theme-btn-disabled-${type}` : ''}`,
      )}
    >
      {!isLoading ? (
        <>
          <span>{prepend}</span>
          <span>{content}</span>
        </>
      ) : type === 'text' ? (
        'Loading...'
      ) : (
        <LoadingSVG activeColor={type === 'primary' ? '#fff' : '#1A88C9'} size={size} />
      )}
    </button>
  );
};

export default CButton;
