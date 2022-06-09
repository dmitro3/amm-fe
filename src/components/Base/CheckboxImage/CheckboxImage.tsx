import classnames from 'classnames/bind';
import React from 'react';
import { ReactComponent as Checked } from 'src/assets/icon/checkbox/checked.svg';
import { ReactComponent as Unchecked } from 'src/assets/icon/checkbox/unchecked.svg';
import style from './CheckboxImage.module.scss';

interface Props {
  size?: 'md' | 'sm';
  onClick?: (checked: boolean) => void;
  onChange?: (value: string) => void;
  checked?: boolean;
  label?: string | React.ReactNode;
  className?: string;
}

const cx = classnames.bind(style);

const CheckboxImage: React.FC<Props> = ({
  size = 'sm',
  checked = false,
  label,
  onClick = () => {},
  className = '',
}) => {
  const [checkedState, setCheckedState] = React.useState(checked);

  React.useEffect(() => {
    setCheckedState(checked);
  }, [checked]);

  return (
    <div
      className={`${cx(`checkbox-container-${size}`)} ${className}`}
      onClick={() => {
        const newState = !checkedState;
        // setCheckedState(newState);
        onClick(newState);
      }}
    >
      {checkedState ? (
        <Checked className={cx(`checkbox-image-${size}`)} />
      ) : (
        <Unchecked className={cx(`checkbox-image-${size}`)} />
      )}
      {label}
    </div>
  );
};

export default CheckboxImage;
