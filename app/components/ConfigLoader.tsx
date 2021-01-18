import React, { ReactNode } from 'react';
import routes from '../constants/routes.json';
import windowData from '../constants/window.json';
import Select from './generic/Select';
import Button from './generic/Button';
import InputFile from './generic/InputFile';

const isProd = process.env.NODE_ENV === 'production';
const windowSize = isProd ? windowData.prod : windowData.dev;

class ConfigLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      configFile: null,
      isLoadingApp: false,
      errorMessage: '',
      isTestingConfigFile: false,
      isVisible: true
    };
  }

  componentDidUpdate(oldProps) {
    if (oldProps.isVisible != this.props.isVisible) {
      // console.log('didUpdate props isvisible', this.props.isVisible);
      if (this.props.isVisible) {
        this.setState({ configFile: null });
        this.resizeWindowCall(windowSize.small.width, windowSize.small.height);
      }
      this.setState({ isVisible: this.props.isVisible });
    }
  }

  componentDidMount() {
    this.resizeWindowCall(windowSize.small.width, windowSize.small.height);
  }

  apiCall = route => {
    let response = fetch('http://localhost:8080/' + route).then(res => {
      // console.log(res);
      return res;
    });
    return response;
  };

  resizeWindowCall = (width, height) => {
    fetch(
      'http://localhost:8080/resize-window?width=' +
        width +
        '&height=' +
        height +
        ''
    ).then(res => {
      // console.log(res);
      return res;
    });
  };

  launchBackend = () => {
    if (this.state.isTestingConfigFile) {
      return;
    }
    this.setState({ isTestingConfigFile: true });

    this.apiCall('test-config-file?file=' + this.state.configFile).then(res => {
      res.json().then(res => {
        if (res.success) {
          this.setState({ isLoadingApp: true });
          this.apiCall('spawn?file=' + this.state.configFile);
          let that = this;
          window.setTimeout(() => {
            that.resizeWindowCall(windowSize.big.width, windowSize.big.height);
            that.setState({ isLoadingApp: false, isTestingConfigFile: false });
            this.props.history.push(routes.BUILDER);
            // that.props.onBackendLoaded();
          }, 1000);
        } else {
          console.log(res.error);
          this.setState({
            isTestingConfigFile: false,
            errorMessage: res.error
          });
        }
      });
    });
  };

  render() {
    const isLoadingButtonClassName = this.state.isTestingConfigFile
      ? 'button--loading'
      : '';
    const buttonClassName =
      'button button--large button--stretched ' + isLoadingButtonClassName;

    return (
      <>
        {this.state.isVisible ? (
          <div className="config-loader screen-size flex-center-wrapper">
            <div>
              {!this.state.isLoadingApp ? (
                <>
                  <h3>Choose a config file to load</h3>
                  <div className="config-loader__content-wrapper">
                    {/* <div className="config-loader__content-wrapper__create">
                      <span>Not implemented yet</span>
                    </div> */}
                    <div className="config-loader__content-wrapper__load">
                      <InputFile
                        onChange={filePath => {
                          this.setState({ configFile: filePath });
                        }}
                      />

                      <Button
                        disabled={
                          this.state.configFile != null ||
                          this.state.isTestingConfigFile
                            ? false
                            : true
                        }
                        className={buttonClassName}
                        onClick={this.launchBackend}
                      >
                        START SERVER
                      </Button>
                      <span className="config-loader__content-wrapper__load__error-message">
                        {this.state.errorMessage}
                      </span>
                      {process.env.NODE_ENV === 'development' ? (
                        <Button
                          className="button button--large button--stretched button--has-type button--has-type--always-visible"
                          onClick={() => {
                            this.props.history.push(routes.BUILDER);
                          }}
                        >
                          <span className="button__type">DEV ONLY</span>
                          Go to builder
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <span className="loading"></span>
              )}
            </div>
          </div>
        ) : null}
      </>
    );
  }
}

export default ConfigLoader;
