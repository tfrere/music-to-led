import React from 'react';
import { SizeMe } from 'react-sizeme';
import isShallowEqual from 'shallowequal';

const height = 10;

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
    const shape_offsets = this.props.physical_shape.offsets;
    const number_of_chunks = this.props.physical_shape.offsets.length - 1;
    const number_of_pixels = this.props.pixels[0].length;
    const gap_size = 20;
    const pixel_width =
      (this.props.width - number_of_chunks * gap_size) / number_of_pixels;

    this.state = {
      shape_offsets: shape_offsets,
      number_of_chunks: number_of_chunks,
      number_of_pixels: number_of_pixels,
      pixel_width: pixel_width,
      gap_size: gap_size
    };
  };

  updateVisualizer = () => {
    const shape_offsets = this.props.physical_shape.offsets;
    const number_of_chunks = this.props.physical_shape.offsets.length - 1;
    const number_of_pixels = this.props.pixels[0].length;
    const gap_size = 20;
    const pixel_width =
      (this.props.width - number_of_chunks * gap_size) / number_of_pixels;

    this.setState({
      shape_offsets: shape_offsets,
      number_of_chunks: number_of_chunks,
      number_of_pixels: number_of_pixels,
      pixel_width: pixel_width,
      gap_size: gap_size
    });
  };

  componentDidUpdate(prevProps) {
    if (!isShallowEqual(this.props.active_shape, prevProps.active_shape)) {
      this.updateVisualizer();
    }
  }

  updateCanvas = () => {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.props.width, height);

    let gapIndex = 0;

    this.props.pixels[0].map((pixel, pixel_index) => {
      this.state.shape_offsets.map(offset => {
        if (offset === pixel_index) {
          gapIndex++;
        }
      });

      ctx.fillStyle =
        'rgb(' +
        this.props.pixels[0][pixel_index] +
        ',' +
        this.props.pixels[1][pixel_index] +
        ',' +
        this.props.pixels[2][pixel_index] +
        ')';

      // ctx.fillRect(
      //   pixel_index * this.state.pixel_width + gapIndex * this.state.gap_size,
      //   0,
      //   this.state.pixel_width,
      //   height
      // );

      ctx.beginPath();
      ctx.arc(
        4 +
          pixel_index * this.state.pixel_width +
          gapIndex * this.state.gap_size,
        4,
        3,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();
    });
  };

  render() {
    return (
      <div className="pixel-visualizer">
        <canvas
          className="pixel-visualizer__canvas"
          ref="canvas"
          width={this.props.width}
          height={height}
        />
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
