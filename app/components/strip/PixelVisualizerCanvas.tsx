import React from 'react';
import { SizeMe } from 'react-sizeme';
import isShallowEqual from 'shallowequal';

class SizedPixelVisualizerCanvas extends React.Component {
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

    console.log('height', height);

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
    const gap_size = this.props.gap_size || 10;
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

  updateCanvas = () => {
    const ctx = this.refs.canvas.getContext('2d');

    ctx.clearRect(0, 0, this.props.width, this.state.height);

    let gapIndex = 0;

    this.props.pixels[0].map((pixel, pixel_index) => {
      this.state.shape_offsets.map(offset => {
        if (offset === pixel_index) {
          gapIndex++;
        }
      });

      ctx.fillStyle =
        'rgb(' +
        this.props.pixels[0][pixel_index] * 5 +
        ',' +
        this.props.pixels[1][pixel_index] * 5 +
        ',' +
        this.props.pixels[2][pixel_index] * 5 +
        ')';

      ctx.fillRect(
        pixel_index * this.state.pixel_width + gapIndex * this.state.gap_size,
        this.state.height / 4,
        this.state.pixel_width,
        this.state.height / 2
      );

      // ctx.beginPath();
      // ctx.arc(
      //   this.state.pixelSize / 2 +
      //     4 +
      //     pixel_index * this.state.pixel_width +
      //     gapIndex * this.state.gap_size,
      //   this.state.height / 2,
      //   this.state.pixelSize,
      //   0,
      //   2 * Math.PI,
      //   false
      // );
      // ctx.fill();
    });
  };

  render() {
    return (
      <div className="pixel-visualizer">
        <div className="pixel-visualizer__canvas-holder">
          <canvas
            className="pixel-visualizer__canvas"
            ref="canvas"
            width={this.props.width}
            height={this.state.height}
          />
        </div>
      </div>
    );
  }
}

class PixelVisualizerCanvas extends React.Component {
  render() {
    return (
      <SizeMe>
        {({ size }) => {
          return (
            <SizedPixelVisualizerCanvas {...this.props} width={size.width} />
          );
        }}
      </SizeMe>
    );
  }
}

export default PixelVisualizerCanvas;
