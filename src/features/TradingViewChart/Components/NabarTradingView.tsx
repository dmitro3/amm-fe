import classNames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';
import { chartstyle, fullScreen, tickSuccess, zoomIn } from 'src/assets/icon';
import ArrowDown from 'src/assets/icon/ArrowDown';
import indicatorSvg from 'src/assets/icon/indicator-light.svg';
import { CImage } from 'src/components/Base/Image';
import { CHART_CONTAINER_ID } from 'src/components/Chart/constant';
import { CHART_TYPE, CHART_TYPE_LIGHT, intervarMasterArr } from 'src/constants/chart/chart-interval';
import ItemNavBar from 'src/features/TradingViewChart/Components/ItemNavBar';
import { isShowTradingChart } from 'src/features/TradingViewChart/Components/redux/ChartRedux.slide';
import { DEFAULT_TRADING_VIEW_INTERVAL, getInterval } from 'src/features/TradingViewChart/helpers';
import style from 'src/features/TradingViewChart/styles/TradingView.module.scss';
import { IntervalObj } from 'src/interfaces/chart/intervalObject';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { THEME_MODE } from 'src/interfaces/theme';

interface Props {
  [key: string]: any;
  containerId?: any;
}

const NabarTradingView: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const cx = classNames.bind(style);
  const [isShowGroupInterval, setIsShowGroupInterval] = useState<boolean>(false);
  const [isShowChartType, setIsShowChartType] = useState<boolean>(false);
  const [isEditBSCBtn, setIsEditBSCBtn] = useState<boolean>(true);
  const [isEditPoolBtn, setIsEditPoolBtn] = useState<boolean>(true);
  const [intervalBSCList, setIntervalBSCList] = useState<Array<IntervalObj>>([]);
  const [intervalPoolList, setIntervalPoolList] = useState<Array<IntervalObj>>([]);
  const defaultIntervalList = ['Time', '15m', '1h', '4h', '1D', '1W'];
  const [isTradingViewActive, setIsTradingViewActive] = useState(true);
  const [isOriginalActive, setIsOriginalActive] = useState(false);
  const [isDepthChartActive, setIsDepthChartActive] = useState(false);
  const [isBSCFullScreenState, setIsBSCFullScreenState] = useState(true);
  const theme = useAppSelector((state) => state.theme.themeMode);
  const [activeInterval, setActiveInterval] = useState(getInterval(DEFAULT_TRADING_VIEW_INTERVAL));
  const [intervalSelected, setIntervalSelected] = useState('');
  const [showHighlighFlag, setShowHighlighFlag] = useState('');
  const [showHighlighPoolFlag, setShowHighlighPoolFlag] = useState('');
  const [highLightBtnDropdow, setHighLightBtnDropdow] = useState(false);
  const [highLightBtnDropdowLP, setHighLightBtnDropdowLP] = useState(false);
  useEffect(() => {
    intervarMasterArr.map((row) => {
      row.row.map((item) => {
        if (defaultIntervalList.includes(item.key)) {
          item.status = true;
          item.poolStatus = true;
          setIntervalBSCList((intervalArr) => [...intervalArr, item]);
          setIntervalPoolList((intervalArr) => [...intervalArr, item]);
        }
      });
    });
  }, []);

  const useComponentVisible = (initialIsVisible: any) => {
    const [isCptVisible, setIsCptVisible] = useState(initialIsVisible);
    const ref = useRef<HTMLDivElement>(null);
    const handleClickOutside = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsCptVisible(false);
        if (isEditBSCBtn) {
          setIsShowGroupInterval(false);
        }
        setIsShowChartType(false);
      }
    };

    useEffect(() => {
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    });

    return { ref, isCptVisible, setIsCptVisible };
  };
  const { ref } = useComponentVisible(true);

  const setInterval = (param: { key: string; value: number }) => {
    if (param.key !== 'Time') {
      props.onSelectInterval(param.value);
      setHighLightBtnDropdow(true);
      setHighLightBtnDropdowLP(true);
    } else {
      props.onSelectInterval(1);
    }
    setIsShowGroupInterval(false);
    setActiveInterval(param.value);
    setIntervalSelected(param.key);
  };
  const showOrHideGroupItv = () => {
    setIsShowGroupInterval(!isShowGroupInterval);
  };

  const openIndicatorPopup = () => {
    props.openIndicatorPopup();
  };

  const showOrHideChartType = () => {
    setIsShowChartType(!isShowChartType);
  };

  const isEditOrSaveBSCBtn = () => {
    setIsEditBSCBtn(!isEditBSCBtn);
    if (!isEditBSCBtn) {
      setIntervalBSCList([]);
      setIsShowGroupInterval(!isShowGroupInterval);
      intervarMasterArr.map((row) => {
        row.row.map((item) => {
          if (item.status) {
            setIntervalBSCList((intervalArr) => [...intervalArr, item]);
          }
        });
      });
    }
  };

  const isEditOrSavePoolBtn = () => {
    setIsEditPoolBtn(!isEditPoolBtn);
    if (!isEditPoolBtn) {
      setIntervalPoolList([]);
      setIsShowGroupInterval(!isShowGroupInterval);
      intervarMasterArr.map((row) => {
        row.row.map((item) => {
          if (item.poolStatus) {
            setIntervalPoolList((intervalArr) => [...intervalArr, item]);
          }
        });
      });
    }
  };

  const setChartType = (chartType: number) => {
    props.setChartType(chartType);
    setIsShowChartType(!setIsShowChartType);
  };
  const setIntervalToList = (intervalObj: any) => {
    intervarMasterArr.map((row) => {
      row.row.map((item) => {
        if (item.key === intervalObj.key) {
          item.status = !item.status;
          setShowHighlighFlag(`${item.key}-${item.status}`);
        }
      });
    });
  };

  const setIntervalToPoolList = (intervalObj: any) => {
    intervarMasterArr.map((row) => {
      row.row.map((item) => {
        if (item.key === intervalObj.key) {
          item.poolStatus = !item.poolStatus;
          setShowHighlighPoolFlag(`${item.key}-${item.poolStatus}`);
        }
      });
    });
  };

  const activeOriginal = () => {
    props.disableLeftToolBar('left_toolbar');
    setIsOriginalActive(true);
    setIsTradingViewActive(false);
    setIsDepthChartActive(false);
    dispatch(isShowTradingChart(true));
  };

  const activeTradingView = () => {
    props.enableLefToolbar('left_toolbar');
    setIsOriginalActive(false);
    setIsTradingViewActive(true);
    setIsDepthChartActive(false);
    dispatch(isShowTradingChart(true));
  };

  const activeDepthChart = () => {
    dispatch(isShowTradingChart(false));
    setIsDepthChartActive(true);
    setIsOriginalActive(false);
    setIsTradingViewActive(false);
  };

  const activeLiquidity = () => {
    props.onSelectTab({
      isLiquidityActive: true,
      isVolumeActive: false,
      isPriceActive: false,
    });
  };

  const activeVolume = () => {
    props.onSelectTab({
      isLiquidityActive: false,
      isVolumeActive: true,
      isPriceActive: false,
    });
  };

  const activePrice = () => {
    props.onSelectTab({
      isLiquidityActive: false,
      isVolumeActive: false,
      isPriceActive: true,
    });
  };

  const fullScreenFunc = () => {
    setIsBSCFullScreenState(!isBSCFullScreenState);
    props.fullScreen(isBSCFullScreenState);
  };

  // const poolFullScreenFunc = () => {
  //   setIsPoolFullScreenState(!isBSCFullScreenState);
  //   props.poolFullScreen(isPoolFullScreenState);
  // };

  return (
    <div>
      {props.containerId === CHART_CONTAINER_ID.StellarChart ? (
        <div className={cx('navbar-tradingview')} style={{ margin: '5px 0' }}>
          <div
            className={
              isDepthChartActive ? cx('navbar-tradingview__left', 'hidden-navbar-left') : cx('navbar-tradingview__left')
            }
          >
            {intervalBSCList
              .slice(0, 10)
              .sort((x: any, y: any) => Number(x.value) - Number(y.value))
              .map((interval, idx) => {
                return (
                  <ItemNavBar
                    content={interval.key}
                    onClick={() => {
                      setInterval(interval);
                      setHighLightBtnDropdow(false);
                    }}
                    key={idx}
                    active={activeInterval == Number(interval.value)}
                  />
                );
              })}
            <div className={cx('parent-position')}>
              <ItemNavBar
                content={
                  <div className={cx('interval-dropdow-sigle')}>
                    <div>
                      {!intervalBSCList.map((item) => item.key).includes(intervalSelected) ? intervalSelected : ''}
                    </div>
                    <ArrowDown pathFill="#A0A3BD" />
                  </div>
                }
                active={highLightBtnDropdow}
                onClick={() => showOrHideGroupItv()}
              />
              <div className={cx('group-interval-parent')}>
                {isShowGroupInterval ? (
                  <div className={cx('group-interval')} ref={ref}>
                    <div className={cx('group-interval-header')}>
                      <div>Select intervals</div>
                      <div
                        onClick={() => isEditOrSaveBSCBtn()}
                        className={!isEditBSCBtn ? cx('btn-edit') : cx('btn-save')}
                      >
                        {isEditBSCBtn ? 'Edit' : 'Save'}
                      </div>
                    </div>
                    {intervarMasterArr.map((row, idx) => {
                      return (
                        <div className={cx('group-interval-line', 'group-interval-line-config')} key={idx}>
                          {row.row.map((it) => {
                            return (
                              <div
                                key={it.key}
                                className={cx('interval-button')}
                                onClick={() => (!isEditBSCBtn ? setIntervalToList(it) : setInterval(it))}
                              >
                                <div
                                  className={
                                    it.status ||
                                    (showHighlighFlag.split('-')[0] === it.key &&
                                      showHighlighFlag.split('-')[1] === 'true')
                                      ? cx('interval-btn-active')
                                      : cx('')
                                  }
                                >
                                  {it.key}
                                </div>
                                {!isEditBSCBtn && it.status ? (
                                  <img src={tickSuccess} alt="Tick" className={cx('interval-img')} />
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
            <div className={isOriginalActive ? cx('hide-chart-type') : cx('')}>
              <ItemNavBar
                content={<CImage src={indicatorSvg} width={12} height={12} shape="square" />}
                onClick={() => openIndicatorPopup()}
              />
            </div>
            <div className={isOriginalActive ? cx('hide-chart-type') : cx('parent-position')}>
              <ItemNavBar
                content={<CImage src={chartstyle} width={12} height={12} shape="square" />}
                onClick={() => showOrHideChartType()}
              />
              <div className={cx('chart-stype-popup')}>
                {isShowChartType ? (
                  <div className={cx('chart-type-parent')} ref={ref}>
                    {theme == THEME_MODE.DARK
                      ? CHART_TYPE.map((item) => {
                          return (
                            <div
                              onClick={() => setChartType(item.type_number)}
                              key={item.type_number}
                              className={cx('chart-type-child')}
                            >
                              <div className={cx('chart-style-line')}>
                                <img src={item.src_type} alt="Bars Chart" />
                                <div>{item.type_name}</div>
                              </div>
                            </div>
                          );
                        })
                      : CHART_TYPE_LIGHT.map((item) => {
                          return (
                            <div
                              onClick={() => setChartType(item.type_number)}
                              key={item.type_number}
                              className={cx('chart-type-child')}
                            >
                              <div className={cx('chart-style-line')}>
                                <img src={item.src_type} alt="Bars Chart" />
                                <div>{item.type_name}</div>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className={cx('navbar-tradingview__right')}>
            <ItemNavBar content="Original" active={isOriginalActive} onClick={() => activeOriginal()} />
            <ItemNavBar content="Trading View" active={isTradingViewActive} onClick={() => activeTradingView()} />
            <ItemNavBar content="Depth" active={isDepthChartActive} onClick={() => activeDepthChart()} />
            <ItemNavBar
              content={
                <img
                  src={isBSCFullScreenState ? fullScreen : zoomIn}
                  alt="Full screen"
                  className={cx('full-screen-img')}
                />
              }
              active={false}
              onClick={() => fullScreenFunc()}
            />
          </div>
        </div>
      ) : (
        <div className={cx('navbar-evrypool')}>
          <div
            className={
              isDepthChartActive ? cx('navbar-tradingview__left', 'hidden-navbar-left') : cx('navbar-tradingview__left')
            }
          >
            {intervalPoolList
              .slice(0, 10)
              .sort((x: any, y: any) => Number(x.value) - Number(y.value))
              .map((interval, idx) => {
                return (
                  <ItemNavBar
                    content={interval.key}
                    onClick={() => {
                      setInterval(interval);
                      setHighLightBtnDropdowLP(false);
                    }}
                    key={idx}
                    active={activeInterval == Number(interval.value)}
                  />
                );
              })}
            <div className={cx('parent-position')}>
              <ItemNavBar
                content={
                  <div className={cx('interval-dropdow-sigle')}>
                    <div>
                      {!intervalPoolList.map((item) => item.key).includes(intervalSelected) ? intervalSelected : ''}
                    </div>
                    <ArrowDown pathFill="#A0A3BD" />
                  </div>
                }
                onClick={() => showOrHideGroupItv()}
                active={highLightBtnDropdowLP}
              />
              <div className={cx('group-interval-parent')}>
                {isShowGroupInterval ? (
                  <div className={cx('group-interval')} ref={ref}>
                    <div className={cx('group-interval-header')}>
                      <div>Select interval</div>
                      <div
                        onClick={() => isEditOrSavePoolBtn()}
                        className={!isEditPoolBtn ? cx('btn-edit') : cx('btn-save')}
                      >
                        {isEditPoolBtn ? 'Edit' : 'Save'}
                      </div>
                    </div>
                    {intervarMasterArr.map((row, idx) => {
                      return (
                        <div className={cx('group-interval-line', 'group-interval-line-config')} key={idx}>
                          {row.row.map((it) => {
                            return (
                              <div
                                key={it.key}
                                className={cx('interval-button')}
                                onClick={() => (!isEditPoolBtn ? setIntervalToPoolList(it) : setInterval(it))}
                              >
                                <div
                                  className={
                                    it.poolStatus ||
                                    (showHighlighPoolFlag.split('-')[0] === it.key &&
                                      showHighlighPoolFlag.split('-')[1] === 'true')
                                      ? cx('interval-btn-active')
                                      : cx('')
                                  }
                                >
                                  {it.key}
                                </div>
                                {!isEditPoolBtn && it.poolStatus ? (
                                  <img src={tickSuccess} alt="Tick" className={cx('interval-img')} />
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className={cx('navbar-tradingview__right')}>
            <ItemNavBar
              content="Liquidity"
              active={props.activeTab.isLiquidityActive}
              onClick={() => activeLiquidity()}
            />
            <ItemNavBar content="Volume" active={props.activeTab.isVolumeActive} onClick={() => activeVolume()} />
            <ItemNavBar content="Price" active={props.activeTab.isPriceActive} onClick={() => activePrice()} />
            <ItemNavBar
              content={
                <img
                  src={isBSCFullScreenState ? fullScreen : zoomIn}
                  alt="Full screen"
                  className={cx('full-screen-img')}
                />
              }
              active={false}
              onClick={() => fullScreenFunc()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NabarTradingView;
