import { ClickAwayListener, Fade, Popper } from '@material-ui/core';
import classnames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import searchIcon from 'src/assets/icon/search.svg';
import { ISelect } from 'src/components/Base/Select/Select';
import { ICoin } from './Constant';
import styles from './DigitalCreditModal.module.scss';
import { ModeDisplay } from 'src/features/MyTransactions/Constant';

const cx = classnames.bind(styles);

interface DigitalCreditModalProps {
  open: boolean;
  refElm: HTMLButtonElement | null;
  handleClose?: any;
  options?: Array<ISelect>;
  pairInfos?: Array<ICoin>;
  onClick?: (value: number) => void;
  modeDisplay?: number;
}
const DigitalCreditModal: React.FC<DigitalCreditModalProps> = ({
  options,
  open,
  handleClose,
  refElm,
  onClick,
  modeDisplay,
}) => {
  const [displayCoins, setDispayCoins] = useState<Array<ISelect>>([]);
  const [displayMode, setDisplayMode] = useState<number>();
  const [keywordSearch, setKeywordSearch] = useState<string>('');
  useEffect(() => {
    if (!!options?.length) {
      setDispayCoins(options);
    }
    setDisplayMode(modeDisplay);
  }, [options, modeDisplay]);
  useEffect(() => {
    setDispayCoins(
      options
        ? options.filter((option: ISelect) => option.label.toLowerCase().includes(keywordSearch.toLowerCase()))
        : [],
    );
  }, [keywordSearch, modeDisplay]);

  const handleClosePopover = () => {
    if (open) {
      handleClose();
      setTimeout(() => setKeywordSearch(''), 200);
    }
  };

  return (
    <>
      {open && (
        <ClickAwayListener onClickAway={handleClosePopover}>
          <Popper
            open={open}
            anchorEl={refElm}
            transition
            placement="bottom"
            disablePortal={false}
            modifiers={{
              flip: {
                enabled: false,
              },
              preventOverflow: {
                enabled: true,
                boundariesElement: 'scrollParent',
              },
            }}
            className={cx('modal-paper')}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps}>
                <div>
                  <div className={cx('content-wrapper')}>
                    <div className={cx('search-wrapper')}>
                      <input
                        className={cx('input-search')}
                        type="text"
                        placeholder="Search"
                        value={keywordSearch}
                        onChange={(event) => setKeywordSearch(event.target.value.trim())}
                      />
                      <div className={cx('search-icon')}>
                        <img src={searchIcon} />
                      </div>
                    </div>
                  </div>
                  <div
                    className={displayMode === ModeDisplay.dashboard ? cx('search-item-dashboard') : cx('search-item')}
                  >
                    {displayCoins.length === 0 ? (
                      <p className={cx('not-found')}>Not found</p>
                    ) : (
                      <>
                        {displayCoins.map((option: ISelect) => (
                          <div
                            className={cx('row')}
                            key={option.value}
                            onClick={() => {
                              if (onClick) {
                                onClick(option.value);
                              }
                              handleClosePopover();
                            }}
                          >
                            <div className={cx('data')}>{option.label}</div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </Fade>
            )}
          </Popper>
        </ClickAwayListener>
      )}
    </>
  );
};

export default DigitalCreditModal;
