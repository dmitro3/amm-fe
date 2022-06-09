import React, { FC } from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { getCookieStorage } from 'src/helpers/storage';
import { routeConstants } from 'src/constants';

interface Props {
  component: typeof React.Component;
  auth: boolean;
}

const PrivateRoute: FC<Props> = ({ component: Component, auth = !!getCookieStorage('access_token'), ...rest }) => (
  <Route
    {...rest}
    render={(props: RouteComponentProps) =>
      auth ? <Component {...props} /> : <Redirect to={routeConstants.LANDING} />
    }
  />
);

export default PrivateRoute;
