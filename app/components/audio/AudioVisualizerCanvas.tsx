import React from 'react';

import convertRange from '../../utils/convertRange';
import { SizeMe } from 'react-sizeme';

const spectrogram_single_frames = 40;
const channels = 24;

class SizedAudioVisualizerCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      channels: 24,
      gap: 2,
      mode: 'bar',
      spectrogram_data: [],
      ctx: null
    };
  }

  componentDidMount() {
    let ctx = this.refs.canvas.getContext('2d');

    this.setState(
      {
        ctx: ctx,
        channels: channels,
        gap: 2,
        mode: 'bar',
        spectrogram_data: []
      },
      () => {
        this.startLoop();
      }
    );
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
    // console.log(this.props.width, this.props.height);
    // perform loop work here
    if (this.state.mode == 'bar') this.updateBarCanvas();
    else this.updateSpectrogramCanvas();

    // Set up next iteration of the loop
    this._frameId = window.requestAnimationFrame(this.loop);
  };

  clearCanvas = () => {
    this.state.ctx.clearRect(0, 0, this.props.width, this.props.height);
  };

  updateBarCanvas = () => {
    if (this.refs.canvas) {
      this.clearCanvas();
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
      this.clearCanvas();
      this.drawSpectrogram();
    }
  };

  drawBar = (gain, opacity_offset) => {
    const bar_channel_width = this.props.width / channels;

    this.props.audio.map((audio_atom, index) => {
      const opacity = opacity_offset;
      let audio_channel = audio_atom * gain;
      audio_channel = audio_channel > .03 ? audio_channel : .03;
      if (
        index < this.props.audio_samples_filter_min ||
        index > this.props.audio_samples_filter_max
      ) {
        this.state.ctx.fillStyle = 'rgba(255,0,0,' + opacity + ')';
      } else {
        this.state.ctx.fillStyle = 'rgba(255,255,255,' + opacity + ')';
      }
      this.state.ctx.fillRect(
        index * bar_channel_width,
        this.props.height - audio_channel * this.props.height,
        bar_channel_width - this.state.gap,
        audio_channel * this.props.height
      );
    });

    // feature that adds strokes to delimitate the audio authorized frame
    // this.state.ctx.fillStyle = 'rgba(255,255,255,.1)';
    // this.state.ctx.fillRect(
    //   this.props.audio_samples_filter_min * bar_channel_width,
    //   0,
    //   .3,
    //   this.props.height
    // );

    // this.state.ctx.fillRect(
    //   this.props.audio_samples_filter_max * bar_channel_width + bar_channel_width,
    //   0,
    //   .3,
    //   this.props.height
    // );

  };

  drawSpectrogram = () => {
    let data = this.state.spectrogram_data;
    data.unshift(this.props.audio);
    if (data.length > spectrogram_single_frames) {
      data.pop();
    }

    const spectrogram_channel_size = this.props.height / channels;
    const spectrogram_single_frame_width =
      this.props.width / spectrogram_single_frames;

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
                spectrogram_single_frame_width * spectrogram_index,
                (spectogram_line.length - index) * spectrogram_channel_size,
                spectrogram_single_frame_width,
                spectrogram_channel_size
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
        style={{ width: this.props.width + 20, height: this.props.height + 20 }}
      >
        <canvas
          className="audio-visualizer__canvas"
          ref="canvas"
          width={this.props.width}
          height={this.props.height}
        />
      </div>
    );
  }
}

class AudioVisualizerCanvas extends React.Component {
  render() {
    return (
      <SizeMe>
        {({ size }) => {
      // console.log("width", size.width);
      return (
              <SizedAudioVisualizerCanvas
              {...this.props}
              width={this.props.width - 20}
              height={this.props.height - 20}
            />
          );
        }}
      </SizeMe>
    );
  }
}

export default AudioVisualizerCanvas;
