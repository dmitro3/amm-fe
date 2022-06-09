import React from 'react';
import Modal from '@material-ui/core/Modal';
import styles from './Modal.module.scss';
import classnames from 'classnames/bind';
import { useAppSelector } from 'src/store/hooks';
import lightCloseIcon from 'src/assets/icon/close-light.svg';
import darkCloseIcon from 'src/assets/icon/close-dark.svg';
import { THEME_MODE } from 'src/interfaces/theme';

const cx = classnames.bind(styles);
interface ModalProps {
  children: React.ReactElement;
  open: boolean;
  onClose: (open: boolean) => void;
  title?: string;
}

const CModal: React.FC<ModalProps> = ({ children, open, onClose, title }: ModalProps) => {
  const theme = useAppSelector((state) => state.theme.themeMode);
  return (
    <Modal open={open} onClose={onClose} className={cx('modal')} disableEscapeKeyDown={true}>
      <div className={cx('modal-panel')}>
        <div className={cx('close')} onClick={() => onClose(false)}>
          <img src={theme === THEME_MODE.DARK ? darkCloseIcon : lightCloseIcon} />
        </div>
        {title && <div className={cx('title')}>{title}</div>}
        {children}
      </div>
    </Modal>
  );
};
export default CModal;
