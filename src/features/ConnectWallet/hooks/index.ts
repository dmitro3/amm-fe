/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setOpenWarningModal } from '../redux/wallet';

const useWallet = () => {
  const isWhiteList = useAppSelector((state) => state.wallet.isWhiteList);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!isWhiteList) {
      dispatch(setOpenWarningModal(true));
    }
  }, [isWhiteList]);
};
