import React from 'react';

const width = 150;
const channels = 24;
const gap = 2;
const channel_size = width / channels;

class AudioVisualizerCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.updateCanvas = this.updateCanvas.bind(this);
  }

  componentDidMount() {
    this.startLoop();
    requestAnimationFrame(this.updateCanvas);
  }

  componentWillUnmount() {
    this.stopLoop();
    requestAnimationFrame(this.updateCanvas);
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

  updateCanvas = () => {
    if (this.refs.canvas) {
      const ctx = this.refs.canvas.getContext('2d');
      ctx.clearRect(0, 0, 150, 100);

      this.props.audio.map((audio_atom, index) => {
        const opacity = Math.round(audio_atom * 10) / 10 + 0.4;
        ctx.fillStyle = 'rgba(255,255,255,' + opacity + ')';
        ctx.fillRect(
          index * channel_size,
          100 - audio_atom * 80,
          channel_size - gap,
          audio_atom * 80
        );
      });
    }
  };

  render() {
    let audioElems = [];

    return (
      <div className="audio-visualizer card">
        <h4 className="audio-visualizer__title">{this.props.name}</h4>
        <canvas
          className="audio-visualizer__canvas"
          ref="canvas"
          width="100%"
          height={100}
        />
      </div>
    );
  }
}

export default AudioVisualizerCanvas;
