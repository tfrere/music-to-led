import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import routes from '../constants/routes.json';
import Select from './generic/Select';

class Nav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      configFiles: [],
      activeConfigFile: null
    };
  }

  componentDidMount() {
    this.getConfigFilesFromNode();
  }

  getConfigFilesFromNode = () => {
    fetch('http://localhost:8080/listConfigFiles').then(res => {
      const toto = res.json().then(data => {
        console.log(data);
        this.setState({
          activeConfigFile: data.files[0],
          configFiles: data.files.map(file => {
            return { name: file, prefix: '' };
          })
        });
      });
      return res;
    });
  };

  apiCall = route => {
    fetch('http://localhost:8080/' + route).then(res => {
      console.log(res);
      return res;
    });
  };

  render() {
    return (
      <nav className="nav">
        <NavLink disabled activeClassName="active" to={routes.INIT}>
          <i className="la la-cog" /> INIT
        </NavLink>
        <NavLink activeClassName="active" to={routes.BUILDER}>
          <i className="la la-pencil-ruler" /> BUILD
        </NavLink>
        <NavLink activeClassName="active" to={routes.SHOW}>
          <i className="la la-satellite"></i> SHOW
        </NavLink>
        <div className="nav__right">
          <Select
            options={this.state.configFiles}
            defaultValue={this.state.configFiles[0]}
            setValue={value => {
              this.state.configFiles.map((elem, index) => {
                if (elem.name === value) {
                  console.log(elem);
                  this.setState({ activeConfigFile: elem.name });
                  this.apiCall('spawnKill?file=' + elem.name);
                }
              });
            }}
          />
          <button
            className="button button--danger"
            onClick={() => {
              this.apiCall('kill');
            }}
          >
            KILL
          </button>
          <button
            className="button button--danger"
            onClick={() => {
              this.apiCall('spawnKill?file=' + this.state.activeConfigFile);
            }}
          >
            START
            {/* <i className="la la-power-off" /> */}
          </button>
        </div>
      </nav>
    );
  }
}

export default Nav;
