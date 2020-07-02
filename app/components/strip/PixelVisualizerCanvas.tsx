import React from 'react';
import { SizeMe } from 'react-sizeme';

class SizedPixelVisualizerCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.updateCanvas = this.updateCanvas.bind(this);
    this.initVisualizer = this.initVisualizer.bind(this);

    this.initVisualizer();
  }

  initVisualizer() {
    console.log('toto');
    const shape_offsets = this.props.active_shape.offsets;
    const number_of_chunks = this.props.active_shape.offsets.length - 1;
    const number_of_pixels = this.props.pixels[0].length;
    const gap_size = 5;
    const pixel_width =
      (this.props.width - number_of_chunks * gap_size) / number_of_pixels;

    this.state = {
      shape_offsets: shape_offsets,
      number_of_chunks: number_of_chunks,
      number_of_pixels: number_of_pixels,
      pixel_width: pixel_width,
      gap_size: gap_size
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.active_shape !== prevProps.active_shape) {
      this.initVisualizer();
    }
  }

  componentDidMount() {
    requestAnimationFrame(this.updateCanvas);
  }

  updateCanvas() {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.clearRect(0, 0, 150, 100);

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
      ctx.fillRect(
        pixel_index * this.state.pixel_width + gapIndex * this.state.gap_size,
        0,
        this.state.pixel_width,
        30
      );
    });

    requestAnimationFrame(this.updateCanvas);
  }

  render() {
    return (
      <div className="pixel-visualizer">
        <canvas
          className="pixel-visualizer__canvas"
          ref="canvas"
          width={this.props.width}
          height={50}
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
