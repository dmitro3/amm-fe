import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { ROUTE_SIDEBAR_ACCOUNT } from 'src/constants/accountSidebarRoute';
import './styles.scss';
import { ReactComponent as ArrowDown } from 'src/assets/icon/sidebar/arrow-down.svg';
import { ReactComponent as ArrowUp } from 'src/assets/icon/sidebar/arrow-up.svg';

export interface IRoute {
  name: string;
  path: string;
  component: any;
  icon?: any;
  children?: IRoute[];
}

interface Props {
  pathRoute: string;
}

const Sidebar: React.FC<Props> = () => {
  const history = useHistory();
  const location = useLocation();
  const [routesActive, setRouteActive] = useState<string>(location.pathname);
  const [menuRoutesActive, setMenuRouteActive] = useState<string[]>([location.pathname]);

  const handleMenuRoute = (route: IRoute) => {
    menuRoutesActive.find((v: string) => v.indexOf(route.path) !== -1)
      ? setMenuRouteActive(menuRoutesActive.filter((item) => !(item.indexOf(route.path) !== -1)))
      : setMenuRouteActive([...menuRoutesActive, route.path]);
  };

  useEffect(() => {
    setRouteActive(location.pathname);
    setMenuRouteActive((r) => r.concat(location.pathname));
  }, [location.pathname]);

  const handleItemRoute = (route: IRoute) => {
    setRouteActive(route.path);
  };

  const renderMenuItem = (item: IRoute) => (
    <li
      key={item.path}
      className={`${routesActive.indexOf(item.path) !== -1 ? 'li-active' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        handleItemRoute(item);
        history.push(item.path);
      }}
    >
      <Link to={item.path} key={item.path} className={`${routesActive.indexOf(item.path) !== -1 ? 'active' : ''}`}>
        <span className="">{item.name}</span>
      </Link>
    </li>
  );
  const renderRoutes = (routes: IRoute[]) =>
    routes.map((item: IRoute) => {
      if (Array.isArray(item.children)) {
        const { icon: Icon } = item;

        return (
          <ul key={item.path + item.name} onClick={() => handleMenuRoute(item)}>
            <div>
              <Icon stroke={routesActive.indexOf(item.path) ? 'var(--color-route)' : 'var(--color-primary)'} />
              <span>{item.name}</span>

              {menuRoutesActive.find((v: string) => v.indexOf(item.path) !== -1) ? (
                <ArrowUp stroke="var(--color-route)" />
              ) : (
                <ArrowDown stroke="var(--color-route)" />
              )}
            </div>

            {menuRoutesActive.find((v: string) => v.indexOf(item.path) !== -1) ? (
              <div>
                {item.children.map((sub: IRoute) => {
                  if (Array.isArray(sub.children)) {
                    return (
                      <ul key={sub.path + sub.name} title={sub.name}>
                        {renderRoutes(sub.children)}
                      </ul>
                    );
                  }
                  return renderMenuItem(sub);
                })}
              </div>
            ) : null}
          </ul>
        );
      }
      return renderMenuItem(item);
    });

  return (
    <div>
      <div className="sidebar-prefix">{renderRoutes(ROUTE_SIDEBAR_ACCOUNT)}</div>
    </div>
  );
};

export default Sidebar;
