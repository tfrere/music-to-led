import React from 'react';
import { SizeMe } from 'react-sizeme';
// import ScenoVisualizer2d from './OldScenoVisualizer2d';
import ScenoVisualizer2d from './ScenoVisualizer2d';
import ScenoVisualizer3d from './ScenoVisualizer3d';
import ThreeVisualizer from './ThreeVisualizer';

class CoreScenoVisualizer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasDarkMode: this.props.hasDarkMode || false,
      hasGrid: true,
      isFullScreen: false,
      is2d: false,
      isChangingView: false,
      hasActiveBoundingBoxVisible:
        this.props.hasActiveBoundingBoxVisible || false
    };
  }

  handleChangeView() {}

  render() {
    const hasGridClass = this.state.hasGrid ? 'grid-overlay' : '';

    const visualizerToRender = this.state.is2d ? (
      <ThreeVisualizer
        width={this.props.width}
        height={this.props.height}
        config={this.props.config}
        pixels={this.props.pixels}
        hasDarkMode={this.state.hasDarkMode}
        hasGrid={!this.state.hasDarkMode}
        activeStripIndex={this.props.activeStripIndex}
        hasActiveBoundingBoxVisible={true}
      />
    ) : (
      <ScenoVisualizer2d
        width={this.props.width}
        height={this.props.height}
        config={this.props.config}
        pixels={this.props.pixels}
        hasDarkMode={this.state.hasDarkMode}
        hasGrid={!this.state.hasDarkMode}
        activeStripIndex={this.props.activeStripIndex}
        hasActiveBoundingBoxVisible={true}
      />
    );

    const isLoadingWrapperVisible = this.state.isChangingView
      ? ' loading-wrapper--visible'
      : '';

    const visualizerWithLoader = (
      <>
        <div className={'loading-wrapper' + isLoadingWrapperVisible}>
          {/* <div className="loading"></div> */}
        </div>
        {visualizerToRender}
      </>
    );

    const componentToRender = (
      <div
        className={
          this.state.isFullScreen
            ? 'sceno-visualizer-holder sceno-visualizer-holder--full-screen'
            : 'sceno-visualizer-holder'
        }
        style={{
          width: '100%',
          height: '300px'
        }}
      >
        <div
          style={{
            height: this.props.height,
            background: this.state.hasDarkMode ? 'black' : 'rgba(0,0,0,0.07)'
          }}
        >
          {this.props.pixels ? (
            <div className={'sceno-visualizer '}>
              <label className="label sceno-visualizer__name">
                {this.state.is2d ? '2D ' : '3D '}
                Visualizer
              </label>
              <div className="sceno-visualizer__toolbar">
                {/* <button
                  onClick={() => {
                    this.setState({
                      is2d: !this.state.is2d
                    });
                  }}
                  className="sceno-visualizer__toggle-has-grid"
                >
                  {this.state.is2d ? (
                    <i className="la la-border-all"></i>
                  ) : (
                    <i className="la la-cube"></i>
                  )}
                </button> */}
                <button
                  onClick={() => {
                    this.setState({
                      hasDarkMode: !this.state.hasDarkMode
                    });
                  }}
                  className="sceno-visualizer__toggle-dark-mode"
                >
                  {this.state.hasDarkMode ? (
                    <i className="la la-moon"></i>
                  ) : (
                    <i className="la la-sun"></i>
                  )}
                </button>
                <button
                  onClick={() => {
                    let that = this;

                    this.setState(
                      {
                        isChangingView: true
                      },
                      () => {
                        window.setTimeout(() => {
                          that.setState(
                            {
                              isFullScreen: !that.state.isFullScreen
                            },
                            () => {
                              window.setTimeout(() => {
                                that.setState({
                                  isChangingView: false
                                });
                              }, 200);
                            }
                          );
                        }, 200);
                      }
                    );
                  }}
                  className="sceno-visualizer__toggle-fullscreen"
                >
                  {this.state.isFullScreen ? (
                    <i className="la la-compress"></i>
                  ) : (
                    <i className="la la-expand"></i>
                  )}
                </button>
              </div>
              <div
                style={{
                  height: this.props.height,
                  width: '100%'
                }}
              >
                {visualizerWithLoader}
              </div>
            </div>
          ) : (
            <div className="loading"></div>
          )}
        </div>
      </div>
    );

    return componentToRender;
  }
}

class ScenoVisualizer extends React.Component {
  render() {
    return (
      <SizeMe monitorHeight={true}>
        {({ size }) => {
          //   console.log(size);
          return (
            <CoreScenoVisualizer
              {...this.props}
              width={size.width}
              height={size.height > 300 ? size.height : 300}
            />
          );
        }}
      </SizeMe>
    );
  }
}

// class ScenoVisualizer extends React.Component {
//     render() {
//       return <CoreScenoVisualizer {...this.props} width={100} height={300} />;
//     }
//   }

export default ScenoVisualizer;
