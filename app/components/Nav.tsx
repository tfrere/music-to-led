import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import routes from '../constants/routes.json';

class Nav extends React.Component {
  constructor(props) {
    super(props);
  }

  launchPythonProcessApiCall = () => {
    fetch('http://localhost:8080/launchPython').then(res => {
      console.log(res);
      return res;
    });
  };

  killPythonProcessApiCall = () => {
    fetch('http://localhost:8080/killPython').then(res => {
      console.log(res);
      return res;
    });
  };

  updateConfigFile = () => {
    fetch('http://localhost:8080/updateConfigFile').then(res => {
      console.log(res);
      return res;
    });
  };

  listPortsAvailable = () => {
    fetch('http://localhost:8080/listPortsAvailable').then(res => {
      console.log(res);
      return res;
    });
  };

  render() {
    return (
      <nav className="nav">
        <NavLink activeClassName="active" to={routes.INIT}>
          <i className="la la-cog" /> INIT
        </NavLink>
        <NavLink activeClassName="active" to={routes.BUILDER}>
          <i className="la la-pencil-ruler" /> BUILD
        </NavLink>
        <NavLink activeClassName="active" to={routes.SHOW}>
          <i className="las la-satellite"></i> SHOW
        </NavLink>
        <div className="nav__right">
          <button
            onClick={() => {
              this.killPythonProcessApiCall();
            }}
          >
            Kill python
          </button>
          <button
            onClick={() => {
              this.launchPythonProcessApiCall();
            }}
          >
            Relaunch python
          </button>
        </div>
      </nav>
    );
  }
}

export default Nav;
