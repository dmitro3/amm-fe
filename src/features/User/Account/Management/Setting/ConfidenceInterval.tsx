import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import stylesSCSS from 'src/features/User/Account/Management/Setting/styles/ConfidenceInterval.module.scss';
import Button from '@material-ui/core/Button';
import { FastField, Form, Formik } from 'formik';
import SelectField from 'src/components/Form/SelectedField';
import edit from 'src/assets/icon/edit.svg';
import styles from 'src/features/User/Account/Management/Setting/styles';
import InputField from 'src/components/Form/InputField';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  getListIntervalSetting,
  putVolatilitySource,
  getVolatilitySource,
  putIntervalDuration,
  getIntervalDuration,
} from 'src/store/auth';
import * as yup from 'yup';
import { Tooltip } from '@material-ui/core';
import coin from 'src/assets/icon/coin.svg';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';

const cx = classNames.bind(stylesSCSS);

interface IInterval {
  annualized: string;
  by_the_interval: string;
  interval: string;
  intervalData: number;
}

enum TimeUnit {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  MONTH = 'month',
}

const timeUnitInfo: {
  [key: string]: {
    unit: string;
    label: string;
    toMinutes: number;
  };
} = {
  minute: {
    unit: 'minute',
    label: 'Minute',
    toMinutes: 1,
  },
  hour: {
    unit: 'hour',
    label: 'Hour',
    toMinutes: 60,
  },
  day: {
    unit: 'day',
    label: 'Day',
    toMinutes: 24 * 60,
  },
  month: {
    unit: 'month',
    label: 'Month',
    toMinutes: 24 * 60 * 30,
  },
};

const getTimeUnitInfo = (time_unit: string) => {
  return time_unit === TimeUnit.MINUTE
    ? timeUnitInfo.minute
    : time_unit === TimeUnit.HOUR
    ? timeUnitInfo.hour
    : time_unit === TimeUnit.DAY
    ? timeUnitInfo.day
    : timeUnitInfo.month;
};

const ConfidenceInterval1: React.FC = () => {
  const dispatch = useAppDispatch();
  const classes = styles();

  const [editVolatility, setEditVolatility] = useState<boolean>(false);
  const [editConfidence, setEditConfidence] = useState<boolean>(false);
  const listIntervalSetting = useAppSelector((state) => state.auth.listIntervalSetting.data);

  const [timeVolatility, setTimeVolatility] = useState(1);
  const [timeInterval, setTimeInterval] = useState<{ time_unit: string; interval: number }>({
    time_unit: TimeUnit.MINUTE,
    interval: 1,
  });

  useEffect(() => {
    async function fetchListIntervalSetting() {
      await dispatch(
        getListIntervalSetting({
          page: 1,
          limit: 20,
        }),
      );
    }
    fetchListIntervalSetting();
  }, []);

  useEffect(() => {
    async function fetchVolatility() {
      const res: any = await dispatch(getVolatilitySource());
      if (!res?.payload?.code) {
        setTimeVolatility(res?.payload?.data?.interval);
      }
    }
    fetchVolatility();
  }, []);

  useEffect(() => {
    async function fetchInterval() {
      const res: any = await dispatch(getIntervalDuration());
      if (!res?.payload?.code) {
        setTimeInterval({
          time_unit: res.payload?.data?.type_convert,
          interval: res.payload?.data?.interval,
        });
      }
    }
    fetchInterval();
  }, []);

  // VOLATILITY
  const validationSchema_VolatilitySource = yup.object({
    volatility: yup.number().required('This field is required.'),
  });

  const initialValues_VolatilitySource = {
    volatility: timeVolatility,
  };

  const volatilityOptions = listIntervalSetting?.map((item: IInterval) => {
    return {
      value: item.intervalData,
      label: item.interval,
    };
  });

  const getVolatilityString = () => {
    if (listIntervalSetting.length > 0) {
      const interval = listIntervalSetting.find((el: IInterval) => el.intervalData === timeVolatility)?.interval;

      if (interval) {
        if (interval.includes('minute')) return interval.replace('minute', timeUnitInfo.minute.label);
        if (interval.includes('hour')) return interval.replace('hour', timeUnitInfo.hour.label);
        if (interval.includes('day')) return interval.replace('day', timeUnitInfo.day.label);
        if (interval.includes('month')) return interval.replace('month', timeUnitInfo.month.label);
      }
    }

    return '';
  };

  // CONFIDENCE INTERVAL
  const validationSchema_ConfidenceIntervalDuration = yup.object({
    time_unit: yup.string().required('This field is required.'),
    interval: yup.number().required('This field is required.'),
  });

  const confidenceIntervalTimeUnitOptions: {
    label: string;
    value: string;
  }[] = [];
  for (const key in timeUnitInfo) {
    confidenceIntervalTimeUnitOptions.push({
      label: timeUnitInfo[key].label,
      value: timeUnitInfo[key].unit,
    });
  }

  const initialValues_ConfidenceIntervalDuration = {
    time_unit: timeInterval.time_unit,
    interval: timeInterval.interval / getTimeUnitInfo(timeInterval.time_unit).toMinutes,
  };

  const getConfidenceIntervalDuration = () => {
    const timeUnitInfo = getTimeUnitInfo(timeInterval.time_unit);

    const interval = timeInterval.interval / timeUnitInfo.toMinutes;

    return `${interval} ${timeUnitInfo.label + (interval > 1 ? 's' : '')}`;
  };

  return (
    <div className={cx('container')}>
      <div className={cx('header')}>
        <div>Confidence interval</div>
        <Tooltip
          title={`Confidence Interval is an estimate of the price range that should contain a given percentage${' '}
          (e.g., 95%) of future executable price observations over the selected confidence interval duration${' '}
          (e.g., 48 hours) given a chosen volatility source (e.g., 1 hour for hourly volatility) and the live${' '}
          effective price (buy side or sell side) at which the order could be executed immediately.`}
        >
          <img src={coin}></img>
        </Tooltip>
      </div>
      <div className={cx('table')}>
        <table>
          <thead>
            <tr>
              <th>Interval</th>
              <th>By the Interval</th>
              <th>Annualized</th>
            </tr>
          </thead>
          <tbody>
            {listIntervalSetting.length > 0 &&
              listIntervalSetting.map((item: IInterval, index: number) => (
                <tr key={index}>
                  <td>{item.interval}</td>
                  <td>{item.by_the_interval}</td>
                  <td>{item.annualized}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className={cx('volatility')}>
        <div className={cx('name')}>Volatility table</div>
        {!editVolatility && (
          <div className={cx('edit')}>
            <div>{getVolatilityString()}</div>
            <img
              className="cursor-pointer"
              src={edit}
              onClick={() => {
                setEditVolatility(true);
              }}
            ></img>
          </div>
        )}
        {editVolatility && (
          <div className={cx('formik-volatility')}>
            <Formik
              initialValues={initialValues_VolatilitySource}
              validationSchema={validationSchema_VolatilitySource}
              onSubmit={async (value, { resetForm, setSubmitting }): Promise<void> => {
                setSubmitting(true);
                let reMount = true;

                const res: any = await dispatch(putVolatilitySource(value.volatility));

                if (!res?.payload.code) {
                  setTimeVolatility(value.volatility);
                  setEditVolatility(false);
                  dispatch(
                    openSnackbar({
                      message: 'Volatility source has been updated successfully!',
                      variant: SnackbarVariant.SUCCESS,
                    }),
                  );

                  reMount = false;
                }

                if (reMount) {
                  setSubmitting(false);
                  resetForm();
                }
              }}
            >
              {(): JSX.Element => {
                return (
                  <Form className={classes.form} id="put-volatility-source">
                    <FastField
                      name="volatility"
                      component={SelectField}
                      placeholder="Choose volatility source"
                      options={volatilityOptions}
                      saveData={true}
                      isTextFieldSearchable={false}
                    />
                  </Form>
                );
              }}
            </Formik>
            <div className={cx('button')}>
              <Button
                className={cx('button_cancel')}
                variant="contained"
                color="primary"
                onClick={() => setEditVolatility(false)}
              >
                Cancel
              </Button>
              <Button
                className={cx('button_submit')}
                form="put-volatility-source"
                variant="contained"
                color="primary"
                type="submit"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className={cx('confidence')}>
        <div className={cx('name')}>Confidence interval duration</div>
        {!editConfidence && (
          <div className={cx('edit')}>
            <div>{getConfidenceIntervalDuration()}</div>
            <img
              className="cursor-pointer"
              src={edit}
              onClick={() => {
                setEditConfidence(true);
              }}
            ></img>
          </div>
        )}
        {editConfidence && (
          <div>
            <Formik
              initialValues={initialValues_ConfidenceIntervalDuration}
              validationSchema={validationSchema_ConfidenceIntervalDuration}
              onSubmit={async (value, { resetForm, setSubmitting }): Promise<void> => {
                setSubmitting(true);
                let reMount = true;

                const { time_unit, interval } = value;

                const num = interval * getTimeUnitInfo(time_unit).toMinutes;

                const res: any = await dispatch(
                  putIntervalDuration({
                    interval: num,
                    type_convert: time_unit,
                  }),
                );

                if (!res?.payload?.code) {
                  setEditConfidence(false);

                  const res: any = await dispatch(getIntervalDuration());

                  if (!res?.payload?.code) {
                    reMount = false;

                    setTimeInterval({
                      time_unit: res.payload.data.type_convert,
                      interval: res.payload.data.interval,
                    });

                    dispatch(
                      openSnackbar({
                        message: 'Interval duration has been updated successfully!',
                        variant: SnackbarVariant.SUCCESS,
                      }),
                    );
                  }
                }

                if (reMount) {
                  setSubmitting(false);
                  resetForm();
                }
              }}
            >
              {(): JSX.Element => {
                return (
                  <Form className={classes.form} id="put-confidence-interval">
                    <FastField
                      name="time_unit"
                      component={SelectField}
                      placeholder="Choose interval duration"
                      options={confidenceIntervalTimeUnitOptions}
                      isTextFieldSearchable={false}
                    />
                    <FastField
                      name="interval"
                      isInteger={true}
                      maxLength={10}
                      component={InputField}
                      placeholder="Enter number"
                    />
                  </Form>
                );
              }}
            </Formik>

            <div className={cx('button')}>
              <Button
                variant="contained"
                color="primary"
                className={cx('button_cancel')}
                onClick={() => setEditConfidence(false)}
              >
                Cancel
              </Button>
              <Button
                className={cx('button_submit')}
                form="put-confidence-interval"
                variant="contained"
                color="primary"
                type="submit"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ConfidenceInterval1;
