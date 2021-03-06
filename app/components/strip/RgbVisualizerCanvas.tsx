import React from 'react';
import { SizeMe } from 'react-sizeme';
import isShallowEqual from 'shallowequal';

import convertRange from '../../utils/convertRange';

const height = 50;

class SizedRgbVisualizerCanvas extends React.Component {
  constructor(props) {
    super(props);

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
    this.updateCanvas();

    // Set up next iteration of the loop
    this._frameId = window.requestAnimationFrame(this.loop);
  };

  initVisualizer = () => {
    const shape_offsets = this.props.physical_shape._offsets;
    const number_of_chunks = this.props.physical_shape._offsets.length - 1;
    const number_of_pixels = this.props.pixels[0].length;
    const gap_size = this.props.gap_size || 20;
    const pixel_width =
      (this.props.width - number_of_chunks * gap_size) / number_of_pixels;

    const baseSize = this.props.width / this.props.pixels[0].length;
    const pixelSize = baseSize > 5 ? baseSize : 5;
    const height = baseSize > 10 ? baseSize : 20;

    this.state = {
      shape_offsets: shape_offsets,
      number_of_chunks: number_of_chunks,
      number_of_pixels: number_of_pixels,
      pixel_width: pixel_width,
      gap_size: gap_size,
      pixelSize: pixelSize,
      height: height
    };
  };

  updateVisualizer = () => {
    const shape_offsets = this.props.physical_shape._offsets;
    const number_of_chunks = this.props.physical_shape._offsets.length - 1;
    const number_of_pixels = this.props.pixels[0].length;
    const gap_size = this.props.gap_size || 20;
    const pixel_width =
      (this.props.width - number_of_chunks * gap_size) / number_of_pixels;

    const baseSize = this.props.width / this.props.pixels[0].length;
    const pixelSize = baseSize > 5 ? baseSize : 3;
    const height = baseSize > 10 ? baseSize : 20;

    this.setState({
      shape_offsets: shape_offsets,
      number_of_chunks: number_of_chunks,
      number_of_pixels: number_of_pixels,
      pixel_width: pixel_width,
      gap_size: gap_size,
      pixelSize: pixelSize,
      height: height
    });
  };

  componentDidUpdate(prevProps) {
    if (!isShallowEqual(this.props.active_shape, prevProps.active_shape)) {
      this.updateVisualizer();
    }
  }

  drawLine(ctx, line, start, end, offset, color) {
    ctx.lineCap = 'round';

    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let i = start; i < end; i++) {
      ctx.lineTo(
        offset + i * this.state.pixel_width,
        height - convertRange(line[i], [0, 255], [0, height])
      );
    }
    ctx.stroke();
  }

  updateCanvas = () => {
    const ctx = this.refs.canvas.getContext('2d');

    ctx.clearRect(0, 0, this.props.width, height);

    let offset = 0;
    let old_offset = 0;
    let gap_index = 0;

    this.state.shape_offsets.map(elem => {
      offset = elem;
      this.drawLine(
        ctx,
        this.props.pixels[0],
        old_offset,
        offset,
        gap_index * this.state.gap_size,
        'rgb(255,0,0)'
      );
      this.drawLine(
        ctx,
        this.props.pixels[1],
        old_offset,
        offset,
        gap_index * this.state.gap_size,
        'rgb(0,255,0)'
      );
      this.drawLine(
        ctx,
        this.props.pixels[2],
        old_offset,
        offset,
        gap_index * this.state.gap_size,
        'rgb(0,0,255)'
      );

      old_offset = elem;
      gap_index++;
    });
  };

  render() {
    return (
      <div className="rgb-visualizer">
        <canvas
          className="rgb-visualizer__canvas"
          ref="canvas"
          width={this.props.width - 20}
          height={height}
        />
      </div>
    );
  }
}

class RgbVisualizerCanvas extends React.Component {
  render() {
    return (
      <SizeMe>
        {({ size }) => {
          return (
            <SizedRgbVisualizerCanvas {...this.props} width={size.width || 100} />
          );
        }}
      </SizeMe>
    );
  }
}

export default RgbVisualizerCanvas;
