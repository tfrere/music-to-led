import React from 'react';
import ConfigLoader from '../components/ConfigLoader';
import { History } from 'history';
import Routes from '../Routes';

class ConfigLoaderPage extends React.Component {
  render() {
    return <ConfigLoader history={this.props.history} />;
  }
}
export default ConfigLoaderPage;
