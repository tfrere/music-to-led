import React from 'react';
import ConfigLoader from '../components/ConfigLoader';
import { History } from 'history';
import Routes from '../Routes';

class ConfigLoaderPage extends React.Component {
  render() {
    return (
      <div className="page page--config-loader">
        <ConfigLoader history={this.props.history} />
      </div>
    );
  }
}
export default ConfigLoaderPage;
