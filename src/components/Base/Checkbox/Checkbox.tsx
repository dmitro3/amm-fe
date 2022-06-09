/* eslint-disable max-len */
import React from 'react';
import './checkbox.scss';

interface Props {
  size?: 'large' | 'medium' | 'small';
  type?: 'default' | string;
  onClick?: (checked: boolean) => void;
  onChange?: (value: string) => void;
  value?: string;
  content?: string;
  checked?: boolean;
  className?: any;
  name?: string;
  id?: string;
  after?: React.ReactNode;
}

const CCheckbox: React.FC<Props> = ({
  id,
  size = 'medium',
  type = 'default',
  onClick = () => {},
  onChange = () => {},
  value = '',
  checked = false,
  content = '',
  className = '',
  name = '',
  after,
}) => {
  return (
    <label
      className={`theme-checkbox-container custom-checkbox-${size} custom-checkbox-${type} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-medium" style={{ width: 'max-content', display: 'flex', alignItems: 'center', height: 36 }}>
        {after}
        {content}
      </span>
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => {
          if (e.target.checked) {
            onChange(value);
          } else {
            onChange('');
          }
          onClick(e.target.checked);
        }}
      />
      <span className="theme-checkbox-checkmark"></span>
    </label>
  );
};

export default CCheckbox;
