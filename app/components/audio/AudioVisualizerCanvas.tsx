import React from 'react';

import convertRange from '../../utils/convertRange';

const spectrogram_single_frames = 40;

class AudioVisualizerCanvas extends React.Component {
  constructor(props) {
    super(props);

    const channels = 24;
    this.state = {
      channels: channels,
      gap: 2,
      mode: 'bar',
      bar_channel_size: this.props.width / channels,
      spectrogram_channel_size: this.props.height / channels,
      spectrogram_data: [],
      spectrogram_single_frame_width:
        this.props.width / spectrogram_single_frames,
      ctx: null
    };
  }

  componentDidMount() {
    let ctx = this.refs.canvas.getContext('2d');
    this.setState({ ctx: ctx }, () => {
      this.startLoop();
    });
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
    if (this.state.mode == 'bar') this.updateBarCanvas();
    else this.updateSpectrogramCanvas();

    // Set up next iteration of the loop
    this._frameId = window.requestAnimationFrame(this.loop);
  };

  updateBarCanvas = () => {
    if (this.refs.canvas) {
      this.state.ctx.clearRect(0, 0, 150, this.props.height);
      if (!this.props.hasModifiers) {
        this.drawBar(1, 0.8);
      } else {
        this.drawBar(this.props.audio_gain, 0.8);
        this.drawBar(1, 0.1);
      }
    }
  };

  updateSpectrogramCanvas = () => {
    if (this.refs.canvas) {
      this.state.ctx.clearRect(0, 0, 150, this.props.height);
      this.drawSpectrogram();
    }
  };

  drawBar = (gain, opacity_offset) => {
    this.props.audio.map((audio_atom, index) => {
      const opacity = opacity_offset;
      const audio_channel = audio_atom * gain;
      if (
        index < this.props.audio_samples_filter_min ||
        index > this.props.audio_samples_filter_max
      ) {
        this.state.ctx.fillStyle = 'rgba(255,0,0,' + opacity + ')';
      } else {
        this.state.ctx.fillStyle = 'rgba(255,255,255,' + opacity + ')';
      }
      this.state.ctx.fillRect(
        index * this.state.bar_channel_size,
        this.props.height - audio_channel * this.props.height,
        this.state.bar_channel_size - this.state.gap,
        audio_channel * this.props.height
      );
    });
  };

  drawSpectrogram = () => {
    let data = this.state.spectrogram_data;
    data.unshift(this.props.audio);
    if (data.length > spectrogram_single_frames) {
      data.pop();
    }

    this.setState(
      {
        spectrogram_data: data
      },
      () => {
        this.state.spectrogram_data.map(
          (spectogram_line, spectrogram_index) => {
            spectogram_line.map((audio_channel, index) => {
              const opacity = audio_channel;
              if (
                index < this.props.audio_samples_filter_min ||
                index > this.props.audio_samples_filter_max
              ) {
                this.state.ctx.fillStyle = 'rgba(255,0,0,' + opacity + ')';
              } else {
                this.state.ctx.fillStyle = 'rgba(255,255,255,' + opacity + ')';
              }
              this.state.ctx.fillRect(
                this.state.spectrogram_single_frame_width * spectrogram_index,
                index * this.state.spectrogram_channel_size,
                this.state.spectrogram_single_frame_width,
                this.state.spectrogram_channel_size
              );
            });
          }
        );
      }
    );
  };

  changeMod = () => {
    if (this.state.mode === 'bar')
      this.setState({ mode: 'spectrogram', spectrogram_data: [] });
    else this.setState({ mode: 'bar' });
  };

  render() {
    return (
      <div
        className={
          this.props.className
            ? this.props.className + ' audio-visualizer'
            : 'audio-visualizer'
        }
        onClick={this.changeMod}
      >
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
