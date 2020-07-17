import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Store } from '../types';
import Routes from '../Routes';

class Root extends React.Component {
  componentWillMount() {
    this.unlisten = this.props.history.listen((location, action) => {
      console.log('on route change');
    });
  }
  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <ConnectedRouter history={this.props.history}>
          <Routes />
        </ConnectedRouter>
      </Provider>
    );
  }
}
export default hot(Root);
