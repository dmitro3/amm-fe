/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { forwardRef, useEffect, useState } from 'react';
import './input.scss';
import { searchIcon } from 'src/assets/icon';

export interface Props {
  [key: string]: any;
  label?: string;
  isBefore?: boolean;
  before?: React.ReactNode;
  after?: React.ReactNode;
  isDisabled?: boolean;
  isOk?: boolean;
  isError?: boolean;
  isWarning?: boolean;
  message?: string;
  isReadOnly?: boolean;
  type?:
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';
  ref?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
  size?: 'lg' | 'sm';
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (v: any) => void;
  classNamePrefix?: string;
  onKeyPress?: (e: any) => void;
  handleSearch?: (e: any) => void;
  invalid?: boolean;
  isRequired?: boolean;
  iconBefore?: string;
  isSearch?: boolean;
  isDisable?: boolean;
  onBlur?: (e: any) => void;
  validateNumber?: boolean;
}

const CInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      label = '',
      name = 'input',
      isSearch = false,
      isBefore = false,
      iconBefore,
      isOk = false,
      isDisable = false,
      isError = false,
      isWarning = false,
      message = '',
      isReadOnly = false,
      type = 'text',
      size = 'lg',
      placeholder = 'Enter...',
      defaultValue = '',
      onChange = () => {},
      classNamePrefix = '',
      onKeyPress = () => {},
      handleSearch = () => {},
      validateNumber = false,
      isRequired = false,
      onBlur = () => {},
    },
    ref,
  ) => {
    const [value, setValue] = useState<string>(defaultValue || '');
    const [cType, setCType] = useState<string>(type);
    const [ok, setOk] = useState<boolean>(isOk);
    const [validNumber, setValidNumber] = useState('');

    useEffect(() => {
      setValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
      isOk && setOk(true);
    }, [isOk]);

    useEffect(() => {
      let idTimeout: any;
      if (ok) {
        idTimeout = setTimeout(() => {
          setOk(false);
        }, 2000);
      }
      return () => clearTimeout(idTimeout);
    }, [ok]);

    const validateNumberFunc = (value: string): string => {
      let response = '';

      const regex = new RegExp('^[0-9]*$');
      if (regex.test(value)) {
        response = value;
        setValidNumber(response);
      } else {
        response = validNumber;
      }
      return response;
    };

    useEffect(() => {}, [value.length]);
    return (
      <div className=" text-gray-600 focus-within:text-gray-400">
        {!!label && (
          <label className="text-medium" htmlFor={name}>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {isSearch && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 span-input">
              <button
                type="submit"
                className="focus:outline-none focus:shadow-outline bg-transparent"
                onClick={() => handleSearch(value)}
              >
                <img src={searchIcon} className={`icon-${size}`} alt="" />
              </button>
            </span>
          )}
          {isBefore && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <img src={iconBefore} className={`icon-${size}`} alt="" />
            </span>
          )}
          <input
            id={name}
            ref={ref}
            type={cType}
            value={value}
            name={name}
            style={{ backgroundColor: 'var(--filter-input-background)' }}
            className={`theme-input rounded-md ${
              isSearch || isBefore ? 'pl-12 theme-input-search' : 'pl-input-16'
            } pr-12 theme-input-${size} ${classNamePrefix} ${isError && 'value-error'} ${ok && 'value-ok'} ${
              isWarning && 'value-warning'
            }`}
            placeholder={placeholder}
            disabled={isDisable}
            readOnly={isReadOnly}
            // autoComplete={process.env.NODE_ENV === 'development' ? 'on' : 'off'}
            autoComplete={'off'}
            onChange={(e) => {
              if (validateNumber) {
                setValue(validateNumberFunc(e.target.value));
                onChange(validateNumberFunc(e.target.value));
              } else {
                onChange(e.target.value);
                setValue(e.target.value);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onKeyPress(value);
              }
            }}
            onBlur={() => {
              onBlur(value);
            }}
          />

          <span className="absolute inset-y-0 right-0 flex items-center pr-4">
            {type === 'password' && !!defaultValue.length && (
              <span className="focus:outline-none focus:shadow-outline cursor-pointer">
                {cType === 'password' ? (
                  <img src={'viewSvg'} className={`icon-${size}`} alt="" onClick={() => setCType('text')} />
                ) : (
                  <img src={'hideSvg'} className={`icon-${size}`} alt="" onClick={() => setCType('password')} />
                )}
              </span>
            )}
            {!!defaultValue.length && isSearch && (
              <button
                type="submit"
                className="focus:outline-none focus:shadow-outline"
                onClick={() => {
                  setValue('');
                  onChange('');
                }}
              >
                <img src={'closeIcon'} className={`icon-${size}`} alt="" />
              </button>
            )}
          </span>
        </div>
        <div className={`text-left ${isError ? 'h-5 mb-1' : ''}`}>
          {isError && <span className="text-red-600 text-xs ">{message}</span>}
          {ok && <span className="text-green-600 text-xs ">{message}</span>}
          {isWarning && <span className="text-yellow-600 text-xs ">{message}</span>}
        </div>
      </div>
    );
  },
);

export default CInput;
