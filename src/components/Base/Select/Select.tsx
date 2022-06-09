/* eslint-disable @typescript-eslint/no-unused-vars */
import { InputAdornment, TextField } from '@material-ui/core';
import classnames from 'classnames/bind';
import React, { Fragment, forwardRef, useRef, useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import stylesSCSS from './styles/Select.module.scss';
import SearchIcon from 'src/assets/icon/search.svg';
import CloseDarkButton from 'src/assets/icon/close-dark.svg';
import './styles/select.scss';
import styles from './styles';

export interface ISelect {
  label: string;
  value: any;
}

export const renderDefaultValueSelect = (string: string): ISelect => ({
  label: string,
  value: string,
});
export const renderOptionsSelect = (arr: string[]): ISelect[] => arr.map((item) => renderDefaultValueSelect(item));
interface Props {
  value?: ISelect | ISelect[];
  onChange: (value: any) => void;
  options: ISelect[];
  defaultValue?: ISelect | ISelect[];
  placeholder?: string;
  isDisabled?: boolean;
  isMulti?: boolean;
  onMenuScrollToBottom?: () => void;
  className?: string;
  isError?: boolean;
  message?: string;
  showSearchBar?: boolean;
  hideSearchBarSearchIcon?: boolean;
}
const cx = classnames.bind(stylesSCSS);

const Menu = (allProps: any) => {
  const { selectProps, ...props } = allProps;
  const { onInputChange, inputValue, setInputValue, onMenuInputFocus, hideSearchBarSearchIcon } = selectProps;

  return (
    <Fragment>
      <components.Menu {...props} selectProps={selectProps}>
        <Fragment>
          <div className={cx('search-bar-container')}>
            <TextField
              variant="outlined"
              className={cx('search-bar', hideSearchBarSearchIcon ? 'search-bar-no-search-icon' : '')}
              placeholder={'Search'}
              value={inputValue}
              onChange={(e) =>
                onInputChange(e.currentTarget.value, {
                  action: 'input-change',
                })
              }
              onMouseDown={(e: any) => {
                e.stopPropagation();
                e.target.focus();
              }}
              onFocus={onMenuInputFocus}
              InputProps={
                hideSearchBarSearchIcon
                  ? undefined
                  : {
                      startAdornment: (
                        <InputAdornment position="start">
                          <img src={SearchIcon} alt="" />
                        </InputAdornment>
                      ),
                    }
              }
            />

            <span className={cx('clear-search-icon-container')}>
              <img src={CloseDarkButton} onClick={() => setInputValue('')} alt="" />
            </span>
          </div>

          <div className={cx('options')}>{props.children}</div>
        </Fragment>
      </components.Menu>
    </Fragment>
  );
};

const CSelect: React.FC<Props> = forwardRef<HTMLInputElement, Props>(
  ({ onChange = () => {}, isError = false, message = '', showSearchBar = false, ...props }, ref) => {
    const classes = styles();

    const containerRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const onDomClick = (e: any) => {
      if (containerRef !== null && containerRef.current !== null) {
        const menu = containerRef.current.querySelector('.select__menu');

        if (!containerRef.current.contains(e.target) || !menu || !menu.contains(e.target)) {
          setIsFocused(false);
          setInputValue('');
        }
      }
    };

    useEffect(() => {
      document.addEventListener('mousedown', onDomClick);

      return () => {
        document.removeEventListener('mousedown', onDomClick);
      };
    }, []);

    return (
      <div ref={containerRef}>
        <Select
          onChange={(v: any) => onChange(Array.isArray(v) ? v.map((item: ISelect) => item.value) : v.value)}
          {...props}
          isSearchable={false}
          className={classes.select}
          classNamePrefix={cx('theme-select')}
          theme={(theme) => ({
            ...theme,
            borderRadius: 0,
            border: '0 !important',
            '&:foc': {
              border: '0 !important',
            },
            colors: {
              ...theme.colors,
              primary: '#1A88C9',
            },
          })}
          components={
            showSearchBar
              ? {
                  Menu,
                }
              : undefined
          }
          inputValue={inputValue}
          setInputValue={setInputValue}
          onMenuInputFocus={() => setIsFocused(true)}
          onInputChange={(val) => setInputValue(val)}
          {...{
            menuIsOpen: isFocused || undefined,
            isFocused: isFocused || undefined,
          }}
          // maxMenuHeight={250}
        />
        <div className="text-left">{isError && <span className="text-red-600 text-xs ">{message}</span>}</div>
      </div>
    );
  },
);

export default CSelect;
