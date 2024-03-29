import React from 'react';

import { svgPathProperties } from 'svg-path-properties';

const minHeight = 300;

class ScenoVisualizer2d extends React.Component {
  constructor(props) {
    super(props);

    const scenes = this.props.config._strips.map(strip => {
      return strip.scene;
    });

    const maxHeight = this.props.config._strips.reduce(function(prev, current) {
      return prev.scene.size.height > current.scene.size.height
        ? prev
        : current;
    }).scene.size.height;

    this.state = {
      ctx: null,
      scenes: scenes,
      hasControls: this.props.hasControls || false,
      height: this.props.height,
      hasDarkMode: this.props.hasDarkMode || false,
      hasGrid: true,
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
    ctx.moveTo(0, 0.5);
    scenes.map((scene, index) => {
      if (scene.backgrounds) {
        ctx.strokeWidth = '2';
        ctx.strokeStyle = 'rgba(255,255,255, 1)';

        scene.backgrounds.map(elem => {
          var path = new Path2D(elem.svg_string);
          // var path = new Path2D('M 100,100 h 50 v 50 h 50');

          ctx.stroke(path);
        });
      }
      scene.shapes.map(elem => {
        ctx.strokeWidth = '9.5';
        ctx.strokeStyle = 'rgba(255,255,255, 0.03)';

        if (
          this.props.hasActiveBoundingBoxVisible &&
          !this.props.hasDarkMode &&
          index == this.props.activeStripIndex
        ) {
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            this.props.width / 2 - this.state.scenes[index].size.width / 2 - 10,
            this.props.height / 2 -
              this.state.scenes[index].size.height / 2 -
              10,
            this.state.scenes[index].size.width + 15,
            this.state.scenes[index].size.height + 15
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

      ctx.fillStyle = 'rgb(' + r[i] * 5 + ',' + g[i] * 5 + ',' + b[i] * 5 + ')';

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
    const hasGridClass = this.props.hasGrid ? 'grid-overlay' : '';
    return (
      <div
        style={{
          height: this.props.height + 2
        }}
      >
        {this.props.pixels ? (
          <div className={'sceno-visualizer ' + hasGridClass}>
            <canvas
              className="sceno-visualizer__canvas"
              ref="canvas"
              width={this.props.width}
              height={this.props.height}
            />
          </div>
        ) : (
          <div className="loading"></div>
        )}
      </div>
    );
  }
}

export default ScenoVisualizer2d;
