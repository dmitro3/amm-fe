/* eslint-disable max-len */
import React, { FC, useState, useEffect, useRef } from 'react';
import { data, ICountry } from 'src/constants/country';
import { CImage } from 'src/components/Base/Image';
import styles from './SelectFlagCode.module.scss';
import classnames from 'classnames/bind';
import searchIcon from 'src/assets/icon/search.svg';
import CloseDarkButton from 'src/assets/icon/close-dark.svg';

const cx = classnames.bind(styles);

interface SelectFlagCodeProps {
  className?: string;
  selectedCountry: ICountry;
  setSelectedCountry: (country: ICountry) => void;
}
const SelectFlagCode: FC<SelectFlagCodeProps> = ({
  className,
  selectedCountry,
  setSelectedCountry,
}: SelectFlagCodeProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [searchCode, setSearchCode] = useState<string>('');
  const [dataCountry, setDataCountry] = useState<ICountry[]>(data);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (country: ICountry) => {
    setSelectedCountry(country);
    setOpen(false);
    setDataCountry(data);
    setSearchCode('');
  };

  const onDomClick = (e: any) => {
    if (containerRef !== null && containerRef.current !== null && !containerRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', onDomClick);

    return () => {
      document.removeEventListener('mousedown', onDomClick);
    };
  }, []);

  return (
    <div ref={containerRef} className={cx('wrapper', className)}>
      <div className={cx('selected-country')} onClick={() => setOpen(!open)}>
        <CImage
          width={30}
          height={20.29}
          src={selectedCountry.countryImageUrl}
          shape="square"
          className={[cx('flag-imge')]}
        />
        <div className={cx('selected-country-code')}>{`+ ${selectedCountry.mobileCode}`}</div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6.81418 9.29353L3.70165 5.83517C3.23832 5.32035 3.60367 4.5 4.29629 4.5L9.70371 4.5C10.3963 4.5 10.7617 5.32035 10.2983 5.83517L7.18582 9.29353C7.08651 9.40387 6.91349 9.40387 6.81418 9.29353Z"
            fill="#4E4B66"
          />
        </svg>
      </div>

      {open && (
        <div className={cx('popup')}>
          <div className={cx('search-wrapper')}>
            <input
              className={cx('input-search')}
              type="text"
              placeholder="Search"
              value={searchCode}
              onChange={(e) => {
                setSearchCode(e.target.value);
                setDataCountry(
                  data.filter(
                    (item) =>
                      `+${item.mobileCode}${item.code}${item.code2}${item.en}`
                        .toLowerCase()
                        .indexOf(e.target.value.toLowerCase()) !== -1,
                  ),
                );
              }}
            />

            <div className={cx('search-icon')}>
              <img src={searchIcon} />
            </div>

            <span className={cx('clear-search-icon-container')}>
              <img
                src={CloseDarkButton}
                onClick={() => {
                  setSearchCode('');
                  setDataCountry(data);
                }}
                alt=""
              />
            </span>
          </div>

          <div className={cx('countries-wrapper')}>
            {dataCountry.length ? (
              <div>
                {dataCountry.map((item) => (
                  <div key={item.code} className={cx('country')} onClick={() => handleSelect(item)}>
                    <span className={cx('flag-wrapper')}>
                      <CImage
                        width={30}
                        height={20}
                        src={item.countryImageUrl}
                        shape="square"
                        className={[cx('flag')]}
                      />
                      <div className={cx('country-text')}> {item.en}</div>
                    </span>
                    <span className={cx('country-text')}>{`+${item.mobileCode}`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cx('not-found-text')}>Not Found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectFlagCode;
