import React, { useState, useEffect } from 'react';
import ResendVerifyEmail from 'src/pages/VerifyEmail/components/ResendVerifyEmail';
import VerifyEmailSuccess from 'src/pages/VerifyEmail/components/VerifyEmailSuccess';
import VerifyEmailFaild from 'src/pages/VerifyEmail/components/VerifyEmailFaild';
import VerifyEmailExpire from 'src/pages/VerifyEmail/components/VerifyEmailExpire';
import { RouteComponentProps } from 'react-router';
import { useAppDispatch } from 'src/store/hooks';
import { verifyEmail } from 'src/store/auth';
import { resendVerifyEmail } from 'src/store/auth';
import { useHistory } from 'react-router-dom';
import routeConstants from 'src/constants/routeConstants';
import httpExceptionSubCode from 'src/constants/httpExceptionSubCode';

const VerifyEmail: React.FC<RouteComponentProps> = (props) => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const [resendEmail, setResendEmail] = useState<boolean>(false);
  const [verifyEmailSuccess, setVerifyEmailSuccess] = useState<boolean>(false);
  const [verifyEmailFaild, setVerifyEmailFaild] = useState<boolean>(false);
  const [verifyEmailExpire, setVerifyEmailExpire] = useState<boolean>(false);

  const queryStr = props.location.search.substring(1);
  const urlParams = new URLSearchParams(queryStr);
  const queryObj = Object.fromEntries(urlParams);

  if (!queryObj.email && !queryObj.token) history.push(routeConstants.SIGN_IN);

  const verifyEmailFc = async () => {
    const res = await dispatch(verifyEmail(queryObj.token));

    if (res?.payload.code === 0) {
      setVerifyEmailSuccess(true);
      return;
    }

    if (res?.payload.status_code === 403) {
      if (res?.payload.code === httpExceptionSubCode.FORBIDDEN.EMAIL_VERIFY_FAILD) setVerifyEmailFaild(true);
      if (res?.payload.code === httpExceptionSubCode.FORBIDDEN.EMAIL_VERIFY_EXPIRE) setVerifyEmailExpire(true);
    }
  };

  useEffect(() => {
    if (queryObj.token) verifyEmailFc();
  }, []);

  if (queryObj.email && resendEmail === false) setResendEmail(true);

  const resendVerifyEmailHandle: any = async () => {
    const res = await dispatch(resendVerifyEmail(queryObj.email ? queryObj.email : queryObj.token));
    if (res?.payload.code === 0) {
      setResendEmail(true);
      setVerifyEmailFaild(false);
      setVerifyEmailExpire(false);
    }

    return res;
  };

  return (
    <>
      {resendEmail && <ResendVerifyEmail email={queryObj.email} resendVerifyEmail={resendVerifyEmailHandle} />}
      {verifyEmailSuccess && <VerifyEmailSuccess />}
      {verifyEmailFaild && <VerifyEmailFaild />}
      {verifyEmailExpire && <VerifyEmailExpire />}
    </>
  );
};

export default VerifyEmail;
