import React from 'react';
import { Button } from '@material-ui/core';
import stylesSCSS from './styles/landing.module.scss';
import className from 'classnames/bind';
import landingImage from 'src/assets/img/landing.svg';
import { routeConstants } from 'src/constants';
import { useHistory } from 'react-router-dom';

const cx = className.bind(stylesSCSS);

const Landing: React.FC = () => {
  const history = useHistory();

  return (
    <div className={cx('landing-page')}>
      <div className={cx('landing-page-container')}>
        <div className={cx('landing-content')}>
          <div className={cx('landing-content-title')}>Next Generation Financial Protocol for Businesses</div>

          <hr className={cx('landing-content-hr')} />

          <div className={cx('landing-content-text')}>
            Velo is a blockchain based financial protocol enabling digital credit issuance and borderless asset transfer
            for businesses using a smart contract system.
          </div>

          <Button
            variant="contained"
            color="primary"
            className={cx('get-start-btn')}
            onClick={() => history.push(routeConstants.REGISTER)}
          >
            Get started
          </Button>
        </div>
        <div className={cx('landing-img')}>
          <img src={landingImage} />
        </div>
      </div>
    </div>
  );
};

export default Landing;
