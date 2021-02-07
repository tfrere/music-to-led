import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import routes from '../constants/routes.json';
import Button from './generic/Button';

class Nav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConfigLoaderVisible: true
    };
  }

  componentDidMount() {
    let cacheElem = document.getElementById('preload-cache');
    window.setTimeout(() => {
      cacheElem.remove();
    }, 1000);
    this.isBackendAlive();
  }

  apiCall = route => {
    fetch('http://localhost:8080/' + route).then(res => {
      // console.log(res);
      return res;
    });
  };

  isBackendAlive = () => {
    fetch('http://localhost:8080/is-backend-alive').then(res => {
      res.json().then(res => {
        // console.log(res);
        if (res.success == true) {
          this.setState({ isConfigLoaderVisible: false });
        }
      });
    });
  };

  render() {
    return (
      <>
        <nav className="nav">
          {/* <NavLink disabled activeClassName="active" to={routes.INIT}>
            <i className="la la-cog" /> INIT
          </NavLink> */}
          <NavLink activeClassName="active" to={routes.BUILDER}>
            <i className="la la-pencil-ruler" /> BUILD
          </NavLink>
          {/* <NavLink activeClassName="active" to={routes.CONFIG_LOADER}>
            <i className="la la-satellite"></i> CONFIG
          </NavLink> */}
          {/* {process.env.NODE_ENV === 'development' ? (
            <NavLink disabled activeClassName="active" to={routes.TEST}>
              <i className="la la-cog" /> TESTS
            </NavLink>
          ) : null} */}

          <div className="nav__right">
            <Button
              className="button button--complement"
              onClick={() => {
                this.apiCall('kill');
                this.setState({ isConfigLoaderVisible: true }, () => {
                  this.props.history.push(routes.CONFIG_LOADER);
                });
              }}
            >
              SHUTDOWN SERVER
            </Button>
          </div>
        </nav>
      </>
    );
  }
}

export default Nav;
