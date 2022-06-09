import React, { useRef, useState } from 'react';
import styles from './SelectMethod.module.scss';
import classnames from 'classnames/bind';
import useClickOutside from 'src/hooks/useClickOutside';
import ArrowDown from 'src/assets/icon/ArrowDown';
import { useAppSelector } from 'src/store/hooks';
import { THEME_MODE } from 'src/interfaces/theme';
import { CCheckbox } from 'src/components/Base/Checkbox';

const cx = classnames.bind(styles);

export interface ISelect {
  value: string;
  label: string;
}
interface Props {
  size?: 'md' | 'lg';
  variant?: 'contained' | 'raw';
  options: any[];
  option: ISelect[];
  onClick: (values: ISelect[]) => void;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode | null;
}

const Select3: React.FC<Props> = ({
  size = 'md',
  variant = 'contained',
  options,
  option,
  onClick,
  startAdornment,
  endAdornment = <ArrowDown />,
}: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<any>();
  const theme = useAppSelector((state) => state.theme.themeMode);
  useClickOutside(ref, () => setOpen(false));

  const handleClick = () => {
    setOpen(!open);
  };

  const handleOnChange = (item: ISelect) => {
    const arrOptions = option;
    const idx = arrOptions.findIndex((e) => e.value === item.value.toString());
    if (idx >= 0) {
      if (option.length > 1) {
        arrOptions.splice(idx, 1);
      }
    } else {
      arrOptions.push({ value: item.value, label: item.label });
    }
    onClick(arrOptions);
  };

  const returnSize = (size: string) => {
    switch (size) {
      case 'lg':
        return 'lg';
      case 'md':
        return 'md';
      default:
        break;
    }
  };

  const returnVariant = (variant: string) => {
    switch (variant) {
      case 'contained':
        return 'contained';
      case 'raw':
        return 'raw';
      default:
        break;
    }
  };

  const renderValueSelectMethod = (selected: ISelect[]) => {
    const arrLabel: string[] = [];
    selected.map((item) => {
      const method = options.filter((e) => e.value.toString() === item.value)[0];
      if (method) {
        arrLabel.push(method.label);
      }
    });
    return arrLabel.length !== options.length ? arrLabel.join(', ') : 'All';
  };

  return (
    <>
      <div className={cx('container')} ref={ref}>
        <div className={cx('select', returnVariant(variant), returnSize(size))} onClick={handleClick}>
          <div>
            {startAdornment}
            <p>{renderValueSelectMethod(option)}</p>
          </div>
          {endAdornment}
        </div>

        {open && (
          <div className={cx('option', returnSize(size))}>
            {options.map((item, idx) => (
              <>
                <div
                  className={cx('dropdown-item')}
                  key={item.value}
                  onClick={() => {
                    handleOnChange(item);
                    handleClick();
                  }}
                >
                  <CCheckbox
                    size="small"
                    value={item.value.toString()}
                    checked={option?.findIndex((e) => e.value === item.value.toString()) > -1}
                    onChange={() => handleOnChange(item)}
                  />
                  <div className={cx('icon')}>
                    <img src={theme === THEME_MODE.DARK ? item.darkIcon : item.lightIcon} />
                  </div>
                  <div className={cx('label')}>{item.label}</div>
                </div>
                {idx !== options.length - 1 && <div className={cx('under-line')}></div>}
              </>
            ))}
          </div>
        )}
      </div>
      {open && <div className={cx('overlay')} />}
    </>
  );
};

export default Select3;
