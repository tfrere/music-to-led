import React from 'react';

class AudioVisualizerCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.updateCanvas = this.updateCanvas.bind(this);

    const channels = 24;
    this.state = {
      channels: channels,
      gap: 2,
      channel_size: this.props.width / channels
    };
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

  updateCanvas = () => {
    if (this.refs.canvas) {
      const ctx = this.refs.canvas.getContext('2d');
      ctx.clearRect(0, 0, 150, this.props.height);

      this.props.audio.map((audio_atom, index) => {
        const opacity = Math.round(audio_atom * 10) / 10 + 0.4;
        const audio_channel = audio_atom * this.props.audio_gain;
        if (
          index < this.props.audio_samples_filter_min ||
          index > this.props.audio_samples_filter_max
        ) {
          ctx.fillStyle = 'rgba(255,0,0,' + opacity + ')';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,' + opacity + ')';
        }
        ctx.fillRect(
          index * this.state.channel_size,
          this.props.height - audio_channel * this.props.height,
          this.state.channel_size - this.state.gap,
          audio_channel * this.props.height
        );
      });
    }
  };

  render() {
    let audioElems = [];

    return (
      <div className="audio-visualizer">
        <canvas
          className="audio-visualizer__canvas"
          ref="canvas"
          width="100%"
          height={this.props.height}
        />
      </div>
    );
  }
}

export default AudioVisualizerCanvas;
