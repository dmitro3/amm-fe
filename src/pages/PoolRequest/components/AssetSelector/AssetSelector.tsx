import { Paper, Popover } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import styles from './AssetSelector.module.scss';
import classnames from 'classnames/bind';
import searchIcon from 'src/assets/icon/search.svg';
import { Token } from '../../interfaces';
import { TokenIcon } from 'src/pages/PoolsList/helpers/TokenIcon';

const cx = classnames.bind(styles);
interface AssetSelectorProps {
  open: boolean;
  refElm: HTMLButtonElement | null;
  handleClose: () => void;
  assets: Array<Token>;
  onSelectAsset: (asset: Token) => void;
}
const AssetSelector: React.FC<AssetSelectorProps> = ({
  open,
  refElm,
  handleClose,
  assets,
  onSelectAsset,
}: AssetSelectorProps) => {
  const [keywordSearch, setKeywordSearch] = useState<string>('');
  const [displayingAsset, setDisplayingAsset] = useState<Array<Token>>([]);

  useEffect(() => {
    setDisplayingAsset(assets);
    setKeywordSearch('');
  }, [assets]);

  useEffect(() => {
    setDisplayingAsset(
      assets.filter((asset: Token) => asset.name?.toLowerCase().includes(keywordSearch.toLowerCase())),
    );
  }, [keywordSearch, assets]);
  return (
    <Popover
      open={open}
      anchorEl={refElm}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      classes={{ paper: cx('modal-paper') }}
    >
      <Paper square classes={{ root: cx('paper') }}>
        <div className={cx('content-wrapper')}>
          <div className={cx('title')}>Digital credit search</div>
          <div className={cx('search-wrapper')}>
            <input
              className={cx('input-search')}
              type="text"
              placeholder="Name or address"
              value={keywordSearch}
              onChange={(event) => setKeywordSearch(event.target.value.trim())}
            />
            <div className={cx('search-icon')}>
              <img src={searchIcon} />
            </div>
          </div>
          <div className={cx('token-list')}>
            {!displayingAsset.length ? (
              <div className={cx('not-found')}>Not found</div>
            ) : (
              <>
                {displayingAsset.map((asset) => (
                  <div key={asset.id} className={cx('token')} onClick={() => onSelectAsset(asset)}>
                    {asset.symbol !== 'All' && <TokenIcon name={asset.symbol} size={36} />}
                    <div className={cx('token-name')}>{asset.name}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </Paper>
    </Popover>
  );
};

export default AssetSelector;
