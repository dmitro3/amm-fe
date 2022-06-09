import { Chip, FormControl, FormHelperText, Input, MenuItem, Select as SelectUI } from '@material-ui/core';
import React, { useState } from 'react';
import { SelectItem } from 'src/interfaces/user';
import styles from './Select.module.scss';
import classnames from 'classnames/bind';
import searchIcon from 'src/assets/icon/search.svg';
import { useEffect } from 'react';

const cx = classnames.bind(styles);
interface SelectProps {
  items: Array<SelectItem>;
  title?: string;
  value: any;
  fullWidth?: boolean;
  setValue?: (value: any) => void;
  className?: string;
  onClick?: () => void;
  error?: string;
  multipleSelect?: boolean;
  handleMultiSelectValue?: (event: React.ChangeEvent<{ value: unknown }>) => void;
  handleDelete?: (value: any) => void;
}

const Select: React.FC<SelectProps> = ({
  items,
  value,
  title,
  setValue,
  className,
  onClick,
  error,
  fullWidth = false,
  multipleSelect,
  handleMultiSelectValue,
  handleDelete,
}: SelectProps) => {
  const [keywordSearch, setKeywordSearch] = useState<string>('');
  const [displayItem, setDisplayItem] = useState<Array<SelectItem>>([]);
  useEffect(() => {
    setDisplayItem(items);
  }, [items]);

  useEffect(() => {
    setDisplayItem(items.filter((item) => item.text === keywordSearch));
  }, [keywordSearch]);
  return (
    <FormControl fullWidth={fullWidth} className={className} error={!!error}>
      {multipleSelect ? (
        <>
          <SelectUI
            labelId="demo-mutiple-chip-label"
            id="demo-mutiple-chip"
            multiple
            variant="outlined"
            value={value}
            displayEmpty
            onChange={handleMultiSelectValue}
            input={
              <Input
                id="select-multiple-chip"
                disableUnderline
                className={cx('multi-select-input', !!error ? 'error' : '')}
              />
            }
            renderValue={(selected) => {
              if ((selected as string[]).length === 0) {
                return <p className={cx('placeholder')}>Choose your functional currency</p>;
              }
              return (
                <div>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={items.find((item) => item.key == value)?.text}
                      onDelete={handleDelete}
                      className={cx('chip')}
                    />
                  ))}
                </div>
              );
            }}
          >
            <div className={cx('search-wrapper')}>
              <input
                className={cx('input-search')}
                type="text"
                placeholder="Search funtional currency"
                value={keywordSearch}
                onChange={(event) => setKeywordSearch(event.target.value.trim())}
              />
              <div className={cx('search-icon')}>
                <img src={searchIcon} />
              </div>
            </div>
            {displayItem.map((item) => (
              <MenuItem key={item.key} value={item.value}>
                {item.text}
              </MenuItem>
            ))}
          </SelectUI>
        </>
      ) : (
        <>
          <SelectUI native variant="outlined" onClick={onClick} value={value} onChange={setValue}>
            {title && <option value={''}>{title}</option>}
            {items.map((item: SelectItem) => (
              <option value={item.value} key={item.key}>
                {item.text}
              </option>
            ))}
          </SelectUI>
        </>
      )}
      <FormHelperText className={cx('helper-text')}>{error}</FormHelperText>
    </FormControl>
  );
};

export default Select;
