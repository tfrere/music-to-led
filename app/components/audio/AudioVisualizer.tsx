import React from 'react';

class AudioVisualizer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let audioElems = [];
    if (this.props.audio) {
      audioElems = this.props.audio.map((audio_atom, index) => {
        return (
          <div
            key={audio_atom + index}
            className="audio-visualizer__bar"
            style={{
              height: audio_atom * 100 + '%',
              opacity: audio_atom + 0.1
            }}
          ></div>
        );
      });
    }

    return (
      <div className="audio-visualizer card">
        <h4 className="card__title">{this.props.name}</h4>
        <div className="audio-visualizer__wrapper">{audioElems}</div>
      </div>
    );
  }
}

export default AudioVisualizer;
