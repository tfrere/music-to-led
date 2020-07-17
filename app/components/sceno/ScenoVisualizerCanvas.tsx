import React from 'react';
import { SizeMe } from 'react-sizeme';

import { svgPathProperties } from 'svg-path-properties';

class ScenoVisualizerCanvas extends React.Component {
  constructor(props) {
    super(props);

    const scenes = this.props.config.strips.map(strip => {
      return strip.scene;
    });

    this.state = {
      isScaled: false,
      ctx: null,
      scenes: scenes,
      hasDarkMode: this.props.hasDarkMode || false,
      hasGrid: this.props.hasGrid || false
    };

    this.initVisualizer();
  }

  componentDidMount() {
    this.startLoop();
  }

  componentWillUnmount() {
    this.stopLoop();
  }

  startLoop = () => {
    if (!this._frameId) {
      this._frameId = window.requestAnimationFrame(this.loop);
    }
  };

  stopLoop = () => {
    window.cancelAnimationFrame(this._frameId);
    // Note: no need to worry if the loop has already been cancelled
    // cancelAnimationFrame() won't throw an error
  };

  loop = () => {
    // perform loop work here
    if (this.refs.canvas && !this.state.ctx) {
      this.setState({ ctx: this.refs.canvas.getContext('2d') });
    }
    if (this.state.ctx) {
      this.updateCanvas();
    }

    // Set up next iteration of the loop
    this._frameId = window.requestAnimationFrame(this.loop);
  };

  initVisualizer = () => {};

  updateVisualizer = () => {};

  updateCanvas = () => {
    const { ctx, scenes } = this.state;
    const strip = this.props.config.strips[0];
    ctx.clearRect(0, 0, this.props.width, this.props.height);

    scenes.map((scene, index) => {
      scene.shapes.map(elem => {
        this.printShape(
          ctx,
          elem.svg_string,
          this.state.scenes[index].size,
          elem.offset,
          this.props.pixels[index][0].slice(
            elem.pixel_range[0],
            elem.pixel_range[1]
          ),
          this.props.pixels[index][1].slice(
            elem.pixel_range[0],
            elem.pixel_range[1]
          ),
          this.props.pixels[index][2].slice(
            elem.pixel_range[0],
            elem.pixel_range[1]
          )
        );
      });
    });
  };

  printShape = (ctx, path, size, offset, r, g, b) => {
    const properties = new svgPathProperties(path);

    const XCenterOffset = (this.props.width / 2 - size.width / 2) * size.scale;
    const YCenterOffset =
      (this.props.height / 2 - size.height / 2) * size.scale;
    const length = properties.getTotalLength();
    const pixels_length = r.length;
    const gap = length / pixels_length;

    let i = 0;

    while (i < pixels_length) {
      const coords = properties.getPointAtLength(gap * i);
      ctx.fillStyle = 'rgb(' + r[i] + ',' + g[i] + ',' + b[i] + ')';

      // ctx.fillRect(coords.x + centerOffset, coords.y, 5, 5);

      ctx.beginPath();
      ctx.arc(
        coords.x * size.scale + XCenterOffset + offset[0],
        coords.y * size.scale + YCenterOffset + offset[1],
        2 * size.scale,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();

      i++;
    }
  };

  render() {
    const hasGridClass = this.state.hasGrid ? 'grid-overlay' : '';
    return (
      <React.Fragment>
        {this.props.pixels ? (
          <div
            className={'sceno-visualizer ' + hasGridClass}
            style={{ height: this.props.height }}
          >
            <div className="sceno-visualizer__toolbar">
              <button
                onClick={() => {
                  this.setState({
                    hasGrid: !this.state.hasGrid
                  });
                }}
                className="sceno-visualizer__toggle-has-grid"
              >
                {this.state.hasGrid ? (
                  <i className="la la-border-all"></i>
                ) : (
                  <i className="la la-tv"></i>
                )}
              </button>
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
            </div>
            <canvas
              className="sceno-visualizer__canvas"
              ref="canvas"
              style={{
                background: this.state.hasDarkMode ? 'black' : 'transparent'
              }}
              width={this.props.width}
              height={this.props.height}
            />
          </div>
        ) : (
          <div className="loading"></div>
        )}
      </React.Fragment>
    );
  }
}

class PixelVisualizerCanvas extends React.Component {
  render() {
    return (
      <SizeMe>
        {({ size }) => {
          return (
            <ScenoVisualizerCanvas
              {...this.props}
              width={size.width}
              height={this.props.height || 500}
            />
          );
        }}
      </SizeMe>
    );
  }
}

export default PixelVisualizerCanvas;
