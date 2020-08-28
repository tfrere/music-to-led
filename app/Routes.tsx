import React from 'react';
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';
import routes from './constants/routes.json';
import BuilderPage from './containers/BuilderPage';
import InitPage from './containers/InitPage';
import TestPage from './containers/TestPage';
import ConfigLoaderPage from './containers/ConfigLoaderPage';
import SplashScreen from './components/SplashScreen';
import Nav from './components/Nav';
import { useHistory } from 'react-router-dom';

export default function Routes() {
  let history = useHistory();
  console.log('history', history);
  return (
    <React.Fragment>
      {/* <div id="full-screen-portal"></div> */}
      <div className="draggable-bar">
        {process.env.npm_package_version ? (
          <small className="software-version">
            <span>v{process.env.npm_package_version}</span>
          </small>
        ) : (
          ''
        )}
      </div>
      {process.env.NODE_ENV !== 'development' ? <SplashScreen /> : ''}
      <Nav history={history} />
      <Switch>
        <Route path={routes.INIT} component={InitPage} />
        <Route path={routes.BUILDER} component={BuilderPage} />
        <Route path={routes.TEST} component={TestPage} />
        <Route path={routes.CONFIG_LOADER} component={ConfigLoaderPage} />
        <Redirect from="*" exact to={routes.CONFIG_LOADER} />
      </Switch>
      <br />
      <br />
      <br />
    </React.Fragment>
  );
}
