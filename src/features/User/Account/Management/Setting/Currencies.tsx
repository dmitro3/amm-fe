import arrayMove from 'array-move';
import React, { useEffect, useState } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { DeleteIcon, deleteLightCurrenciesIcon, DragIndicatorIcon, PasswordIcon, PlusIcon } from 'src/assets/icon';
import CSelect from 'src/components/Base/Select/Select';
import classnames from 'classnames/bind';
import styles from './Setting.module.scss';
import { useAppSelector } from 'src/store/hooks';
import { CButton } from 'src/components/Base/Button';
import { useDispatch } from 'react-redux';
import { getAllFunctionalCurrencies, updateFunCurrencies } from 'src/features/User/redux/apis';
import store from 'src/store/store';
import { THEME_MODE } from 'src/interfaces/theme';
import { IFunCurrency, IOptionSelect } from 'src/features/User/Account/Account.interface';
import { deleteFunCurrency, FunCurrencies, getMe, setSelectedFunctionalCurrencyId } from 'src/store/auth';
import coin from 'src/assets/icon/coin.svg';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { Tooltip } from '@material-ui/core';
import _ from 'lodash';

const SortableItem = SortableElement(({ value, onDelete = () => {}, primaryKey, onlyItem = false }: any) => {
  const theme = store.getState().theme.themeMode;
  const dispatch = useDispatch();
  return (
    <div
      style={{
        display: 'flex',
        padding: '10px',
        margin: '5px',
        backgroundColor: theme == THEME_MODE.DARK ? '#3D4045' : '#E6E8EA',
        color: '#848E9C',
        borderRadius: '10px',
        alignItems: 'center',
      }}
    >
      <div>
        <img style={{ marginRight: '5px' }} src={DragIndicatorIcon} />
        {primaryKey && <img style={{ marginRight: '5px' }} src={PasswordIcon} />}{' '}
      </div>
      <div style={{ flexGrow: 1 }}>{value.label}</div>
      <button
        style={{
          position: 'relative',
          width: 18,
          height: 18,
          background: `url(${theme === THEME_MODE.DARK ? DeleteIcon : deleteLightCurrenciesIcon})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={
          onlyItem
            ? () => {
                dispatch(
                  openSnackbar({
                    message: 'Sorry, you must have at least one functional currency. Please choose another currency.',
                    variant: SnackbarVariant.ERROR,
                  }),
                );
              }
            : onDelete
        }
      ></button>
    </div>
  );
});
const SortableList = SortableContainer(({ items, onDelete }: any) => {
  return (
    <div>
      {items?.length > 1 &&
        items?.map((value: any, index: number) => (
          <SortableItem
            key={`${value.value}`}
            index={index}
            value={value}
            onDelete={() => {
              onDelete(value.value);
            }}
            primaryKey={!!(index === 0)}
          />
        ))}
      {items?.length === 1 &&
        items?.map((value: any, index: number) => (
          <SortableItem
            onlyItem={true}
            key={`${value.value}`}
            index={index}
            value={value}
            onDelete={() => {
              onDelete(value.value);
            }}
            primaryKey={!!(index === 0)}
          />
        ))}
    </div>
  );
});

const cx = classnames.bind(styles);
const Currencies: React.FC = () => {
  const dispatch = useDispatch();

  // const
  const [error, setError] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    dispatch(getAllFunctionalCurrencies());
  }, []);

  const currenciesUserStore: IOptionSelect[] = useAppSelector(
    (state) => state.auth.currentUser.listUserFunCurrencies,
  )?.map((item) => ({
    isActive: item.is_active,
    value: item.functional_currencies_id,
    label: item.functional_currencies_iso_code,
  }));

  const funCurrenciesStore: IFunCurrency[] = useAppSelector((state) => state.user.funCurrencies);

  const options: IOptionSelect[] = funCurrenciesStore?.map(({ id: value, iso_code: label }: IFunCurrency) => ({
    value,
    label,
  }));

  const [currenciesState, setCurrenciesState] = useState<IOptionSelect[]>(currenciesUserStore);

  const refreshCurrencies = (currenciesUserStore: IOptionSelect[]) => {
    const currenciesClone = _.cloneDeep(currenciesUserStore);
    const idx = currenciesUserStore?.findIndex((e) => e.isActive === FunCurrencies.primary);
    if (idx >= 0) {
      const activeCur = currenciesClone[idx];
      currenciesClone.splice(idx, 1);
      currenciesClone.unshift(activeCur);
    }
    return currenciesClone;
  };

  useEffect(() => {
    setCurrenciesState(() => refreshCurrencies(currenciesUserStore));
  }, [currenciesUserStore?.length, currenciesUserStore?.find((i) => i.isActive === 2)?.value]);

  const handleSaveChangesCurrencies = async (currenciesState: IOptionSelect[], isInsert?: boolean) => {
    const primaryCurStore = currenciesUserStore.find((e) => e.isActive === FunCurrencies.primary);
    if (currenciesState[0].value === primaryCurStore?.value && !isInsert) return;
    const body = {
      functional_currencies: currenciesState?.map((item) => item.value),
    };
    await dispatch(updateFunCurrencies(body));
    await dispatch(getMe());
  };

  const onSortEnd = ({ oldIndex, newIndex }: any) => {
    setCurrenciesState(arrayMove(currenciesState, oldIndex, newIndex));
    if (currenciesState?.length > 0) {
      dispatch(setSelectedFunctionalCurrencyId(arrayMove(currenciesState, oldIndex, newIndex)[0].value));
      handleSaveChangesCurrencies(arrayMove(currenciesState, oldIndex, newIndex));
    }
  };

  const [edit, setEdit] = useState(false);

  const restOptions = options.filter(
    ({ value: rsValue1 }: IOptionSelect) => !currenciesState?.some(({ value: rsValue2 }) => rsValue2 === rsValue1),
  );

  useEffect(() => {
    !edit && setError({});
  }, [edit]);

  return (
    <div className={cx('currencies')}>
      <div className={cx('header')}>
        <div style={{ display: 'flex' }}>
          <div className={cx('title')}>Currencies</div>
          {!edit ? (
            <Tooltip
              title={'You can choose to display statistics in different currencies by the filter in the header.'}
            >
              <img src={coin}></img>
            </Tooltip>
          ) : null}
        </div>

        {!edit && (
          <div
            className={cx('button-edit')}
            onClick={() => {
              setEdit(!edit);
              if (edit) {
                setCurrenciesState(currenciesUserStore);
              }
            }}
          >
            Edit currencies
          </div>
        )}
      </div>
      {!edit && !!currenciesUserStore?.length ? (
        <SortableList
          items={currenciesState}
          onSortEnd={onSortEnd}
          onDelete={async (id: number) => {
            await dispatch(deleteFunCurrency(id));
            setCurrenciesState(currenciesState.filter((item: IOptionSelect) => item.value !== id));
            await handleSaveChangesCurrencies(currenciesState.filter((item: IOptionSelect) => item.value !== id));
            await dispatch(getMe());
          }}
        />
      ) : (
        <div>
          {currenciesState?.map((item, index) => (
            <div className={cx('item')} key={item.value}>
              <CSelect
                options={options.filter(
                  ({ value: rsValue1 }: IOptionSelect) =>
                    !currenciesState?.some(({ value: rsValue2 }) => rsValue2 === rsValue1),
                )}
                defaultValue={item}
                onChange={(v) => {
                  const newA = currenciesState
                    .slice(0, index)
                    .concat(options.find((x: IOptionSelect) => x.value === v) || [])
                    .concat(currenciesState.slice(index + 1));
                  if (currenciesState?.map((item) => item.value).includes(v)) {
                    setError({
                      ...error,
                      [`${index}`]: `currencies exists`,
                    });
                    return;
                  } else {
                    delete error[`${index}`];
                    setError({
                      ...error,
                    });
                    setCurrenciesState(newA);
                  }
                }}
              />
              <div style={{ color: 'red' }}>{error[`${index}`] && <div>{error[`${index}`]}</div>}</div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <div>
          {restOptions.length > 0 && (
            <div
              className={cx('button-add-currency')}
              onClick={() => setCurrenciesState([...currenciesState, restOptions[0]])}
            >
              <img src={PlusIcon} />
              <div>Add currency</div>
            </div>
          )}
          <div className={cx('button-container')}>
            <CButton
              classNamePrefix={cx('button_cancel')}
              size="sm"
              type="secondary"
              onClick={() => {
                setEdit(false);
                setCurrenciesState(currenciesUserStore);
              }}
              content="Cancel"
            />
            <CButton
              classNamePrefix={cx('button_submit')}
              size="sm"
              type="primary"
              isDisabled={!!Object.keys(error).length}
              onClick={async () => {
                setEdit(false);
                await handleSaveChangesCurrencies(currenciesState, true);
                // dispatch(
                //   openSnackbar({
                //     message: 'Functional currency has been updated successfully! ',
                //     variant: SnackbarVariant.SUCCESS,
                //   }),
                // );
              }}
              content="Save changes"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Currencies;
