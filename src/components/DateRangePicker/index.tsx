import React, { useRef, useState } from 'react';
import { DateRangePicker as DatePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { setTimeUTC } from 'src/features/User/Account/misc/helper';
import { getEndOfDay, getFirstOfDay, renderDate, subTimeJS } from 'src/helpers/date';
import useOnClickOutside from 'src/hooks/useClickOutside';
import './style.scss';

export interface IDate {
  startDate: Date;
  endDate: Date;
  key?: string;
}
type DateActive = 'week' | 'month' | 'custom';

interface Props {
  onChange: (v: IDate) => void;
  showOptionDate?: boolean;
  classNameProps?: string;
  maxDate?: Date;
  minDate?: Date;
  activeSelected?: boolean;
  monthDisplayFormat?: string;
}
const isDateUTCEqualDateTimezone =
  new Date().getUTCDate() === new Date().getDate() && new Date().getHours() >= setTimeUTC(2).getHours();

const CustomDateRangePicker: React.FC<Props> = ({
  onChange = () => {},
  showOptionDate = false,
  classNameProps,
  maxDate,
  minDate,
  activeSelected = false,
  monthDisplayFormat = 'MMMM',
}) => {
  const [show, setShow] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [dateActive, setDateActive] = useState<DateActive>('week');
  const [state, setState] = useState([
    {
      startDate: subTimeJS(new Date(), isDateUTCEqualDateTimezone ? 7 : 8, 'day'),
      endDate: subTimeJS(new Date(), isDateUTCEqualDateTimezone ? 1 : 2, 'day'),
      key: 'selection',
    },
  ]);

  const refDate = useRef({
    startDate: state[0].startDate,
    endDate: state[0].endDate,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOnChange = (ranges: any) => {
    const { selection } = ranges;

    if (selection.startDate.getTime() === selection.endDate.getTime()) {
      setState([
        {
          ...selection,
          startDate: new Date(getFirstOfDay(selection.startDate)),
          endDate: new Date(getEndOfDay(selection.endDate)),
        },
      ]);
    } else {
      setState([selection]);
    }
  };
  const ref = useRef(null);

  const handleClickOutside = () => {
    setShow(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  return (
    <div>
      <div className={`btn-select ${classNameProps}`}>
        {showOptionDate && (
          <span>
            <button
              onClick={() => {
                setShowDate(false);
                onChange({
                  startDate: subTimeJS(new Date(), isDateUTCEqualDateTimezone ? 7 : 8, 'day'),
                  endDate: subTimeJS(new Date(), isDateUTCEqualDateTimezone ? 1 : 2, 'day'),
                });
                setDateActive('week');
              }}
              className="btn-element"
              style={{
                background: 'var(--color-input-bg)',
                cursor: 'pointer',
                color: activeSelected && dateActive === 'week' ? 'var(--color-primary)' : 'var(--title-active)',
                border:
                  activeSelected && dateActive === 'week' ? '1px solid var(--color-primary)' : 'var(--title-active)',
              }}
            >
              Last 7 days
            </button>
            <button
              onClick={() => {
                setShowDate(false);
                onChange({
                  startDate: subTimeJS(new Date(), isDateUTCEqualDateTimezone ? 30 : 31, 'day'),
                  endDate: subTimeJS(new Date(), isDateUTCEqualDateTimezone ? 1 : 2, 'day'),
                });
                setDateActive('month');
              }}
              className="btn-element"
              style={{
                background: 'var(--color-input-bg)',
                cursor: 'pointer',
                color: activeSelected && dateActive === 'month' ? 'var(--color-primary)' : 'var(--title-active)',
                border:
                  activeSelected && dateActive === 'month' ? '1px solid var(--color-primary)' : 'var(--title-active)',
              }}
            >
              Last 30 days
            </button>
            <button className="btn-element" style={{ background: 'var(--color-input-bg)' }}>
              <div
                onClick={() => {
                  setShow(!show);
                  setDateActive('custom');
                }}
                style={{
                  position: 'relative',
                  zIndex: 10,
                  // top: '-10px',
                }}
              >
                {!showDate ? (
                  <span
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      // background: 'var(--input-background)',
                      cursor: 'pointer',
                      width: 'max-content',
                      color: activeSelected && dateActive === 'custom' ? 'var(--color-primary)' : 'var(--title-active)',
                      border:
                        activeSelected && dateActive === 'custom'
                          ? '1px solid var(--color-primary)'
                          : 'var(--title-active)',
                    }}
                  >
                    Custom Range
                  </span>
                ) : (
                  <span
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      // background: 'var(--input-background)',
                      cursor: 'pointer',
                      color: dateActive === 'custom' ? 'var(--color-primary)' : 'var(--title-active)',
                      border: dateActive === 'custom' ? '1px solid var(--color-primary)' : 'var(--title-active)',
                    }}
                  >
                    {renderDate(state[0].startDate)} - {renderDate(state[0].endDate)}
                  </span>
                )}
              </div>
              {show && (
                <div className="form" ref={ref}>
                  <DatePicker
                    onChange={handleOnChange}
                    moveRangeOnFirstSelection={false}
                    months={2}
                    ranges={state}
                    editableDateInputs={false}
                    direction="horizontal"
                    weekStartsOn={1}
                    monthDisplayFormat={monthDisplayFormat}
                    weekdayDisplayFormat="iiiiii"
                    maxDate={maxDate}
                    minDate={minDate}
                  />
                  <div className="btn">
                    <div>
                      <button
                        className="cancelBtn"
                        onClick={() => {
                          setShow(false);
                          setState([
                            {
                              startDate: refDate.current.startDate,
                              endDate: refDate.current.endDate,
                              key: 'selection',
                            },
                          ]);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="submitBtn"
                        onClick={() => {
                          setShow(false);
                          onChange(state[0]);
                          refDate.current = { ...state[0] };
                          setShowDate(true);
                          setDateActive('custom');
                        }}
                      >
                        Set Date
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default CustomDateRangePicker;
