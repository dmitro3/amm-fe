import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import stylesSCSS from 'src/features/User/Account/Management/Setting/styles/Notifications.module.scss';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import axiosInstance from 'src/services/config';
import { IResponseService } from 'src/interfaces/response';
const cx = classNames.bind(stylesSCSS);

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface ISendMailResponse {
  id: number;
  key: string;
  user_id: number;
  value: string;
}
enum IsSendMail {
  Disabled = 0,
  Enabled = 1,
}

interface Props extends SwitchProps {
  classes: Styles;
}

const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 48,
      height: 26,
      padding: 0,
      margin: theme.spacing(1),
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(22px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: 'var(--color-primary)',
          opacity: 1,
          border: 'none',
        },
      },
      '&$focusVisible $thumb': {
        color: '#52d869',
        border: '1px solid #fff',
      },
    },
    thumb: {
      width: 24,
      height: 24,
    },
    track: {
      borderRadius: 30 / 2,
    },
    checked: {},
    focusVisible: {},
  }),
)(({ classes, ...props }: Props) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const Notifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [isSendMail, setIsSendMail] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const notiResApi: IResponseService<ISendMailResponse[]> = await axiosInstance.get('/users/settings');
        const checkUserEnabled: ISendMailResponse | undefined = notiResApi.data?.find(
          (user) => user.user_id === currentUser.id,
        );
        setIsSendMail(
          checkUserEnabled?.key === 'IsMailNotificationEnable' && Number(checkUserEnabled.value) === IsSendMail.Enabled,
        );
      } catch (error) {
        if (error.response) {
          throw error.response;
        }
        return [];
      }
    })();
  }, [isSendMail, currentUser.id]);

  const handleChange = async () => {
    try {
      const rs: IResponseService<ISendMailResponse> = await axiosInstance.put('/users/update-notification-setting', {
        enable: isSendMail ? 0 : 1,
      });
      const checkEnabled = rs.data?.key === 'IsMailNotificationEnable' && Number(rs.data.value) === IsSendMail.Enabled;
      if (checkEnabled) {
        setIsSendMail(true);
        dispatch(
          openSnackbar({
            message: 'Email notifications have been turned on!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
      } else {
        setIsSendMail(false);
        dispatch(
          openSnackbar({
            message: 'Email notifications have been turned off!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
      }
    } catch (error) {
      if (error.response) {
        throw error.response;
      }
      return {};
    }
  };

  return (
    <div className={cx('container')}>
      <div className={cx('title')}>Notifications</div>
      <div className={cx('on_off')}>
        <div>Email notifications</div>
        <div className={cx('switch')} style={{ marginLeft: '15px' }}>
          <IOSSwitch checked={isSendMail} onChange={handleChange} name="checked" />
        </div>
      </div>
      <div className={cx('info')}>
        Once enable, you will receive notifications via email when there are change on FCX 2.0
      </div>
    </div>
  );
};

export default Notifications;
