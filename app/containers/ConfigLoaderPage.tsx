import React from 'react';
import ConfigLoader from '../components/ConfigLoader';

class ConfigLoaderPage extends React.Component {
  render() {
    return <ConfigLoader history={this.props.history} />;
  }
}
export default ConfigLoaderPage;
