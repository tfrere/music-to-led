import React from 'react';
import { SizeMe } from 'react-sizeme';

import { svgPathProperties } from 'svg-path-properties';

class ScenoVisualizerCanvas extends React.Component {
  constructor(props) {
    super(props);

    const scenes = this.props.config._strips.map(strip => {
      return strip.scene;
    });

    this.state = {
      ctx: null,
      scenes: scenes,
      hasDarkMode: this.props.hasDarkMode || false,
      hasGrid: this.props.hasGrid || false,
      hasActiveBoundingBoxVisible:
        this.props.hasActiveBoundingBoxVisible || false
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
    const strip = this.props.config._strips[0];
    ctx.clearRect(0, 0, this.props.width, this.props.height);

    scenes.map((scene, index) => {
      scene.shapes.map(elem => {
        ctx.strokeWidth = '2';
        ctx.strokeStyle = 'rgba(255,255,255, 0.03)';

        if (
          this.props.hasActiveBoundingBoxVisible &&
          this.state.hasGrid &&
          index == this.props.activeStripIndex
        ) {
          ctx.setLineDash([3, 12]);
          ctx.strokeRect(
            this.props.width / 2 - this.state.scenes[index].size.width / 2 - 10,
            this.props.height / 2 -
              this.state.scenes[index].size.height / 2 -
              10,
            this.state.scenes[index].size.width + 20,
            this.state.scenes[index].size.height + 20
          );
        }

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

    const XCenterOffset = this.props.width / 2 - (size.width * size.scale) / 2;
    const YCenterOffset =
      this.props.height / 2 - (size.height * size.scale) / 2;
    const length = properties.getTotalLength();
    const pixels_length = r.length;
    const gap = length / pixels_length;

    let i = 0;

    while (i < pixels_length) {
      const coords = properties.getPointAtLength(gap * i);

      ctx.fillStyle = 'rgb(' + r[i] * 2 + ',' + g[i] * 2 + ',' + b[i] * 2 + ')';

      ctx.beginPath();
      ctx.arc(
        size.scale * coords.x + XCenterOffset + offset[0],
        size.scale * coords.y + YCenterOffset + offset[1],
        2,
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
