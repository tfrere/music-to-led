import React from 'react';

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;

import convertRange from '../../utils/convertRange.js';
import guessNoteNumber from '../../utils/guessNoteNumber.js';

const keyConfiguration = {
  effects: [
    {
      name: 'scroll',
      label: 'Scroll',
      note: 'C3',
      type: 'sound'
    },
    {
      name: 'energy',
      label: 'Energy',
      note: 'C#3',
      type: 'sound'
    },
    {
      name: 'channel_flash',
      label: 'Chan. Flash',
      note: 'D3',
      type: 'sound'
    },
    {
      name: 'channel_intensity',
      label: 'Chan. Intensity',
      note: 'D#3',
      type: 'sound'
    },

    {
      name: 'piano_scroll',
      label: 'Midi Scroll',
      note: 'F3',
      type: 'midi'
    },
    {
      name: 'piano_note',
      label: 'Midi note',
      note: 'F#3',
      type: 'midi'
    },
    {
      name: 'pitchwheel_flash',
      label: 'Pitch. Flash',
      note: 'G3',
      type: 'midi'
    },
    {
      name: 'alternate_color_chunks',
      label: 'Alt. Chunks',
      note: 'G#3',
      type: 'time'
    },

    {
      name: 'alternate_color_shapes',
      label: 'Alt. Shapes',
      note: 'A3',
      type: 'time'
    },
    {
      name: 'transition_color_shapes',
      label: 'Fade colors',
      note: 'A#3',
      type: 'time'
    },
    {
      name: 'draw_line',
      label: 'Draw',
      note: 'B3',
      type: 'generic'
    },

    {
      name: 'full_color',
      label: 'Full',
      note: 'B#3',
      type: 'generic'
    },
    {
      name: 'fade_out',
      label: 'Fade to black',
      note: 'C#4',
      type: 'generic'
    },
    {
      name: 'clear_frame',
      label: 'Clear',
      note: 'D4',
      type: 'generic'
    },
    {
      name: 'fire',
      label: 'Fire',
      note: 'D#4',
      type: 'generic'
    }
  ],
  modifiers: [
    {
      name: 'reverse',
      label: 'Reverse',
      note: 'E4',
      type: 'generic'
    },
    {
      name: 'mirror',
      label: 'Mirror',
      note: 'E#4',
      type: 'generic'
    },
    {
      name: 'shape',
      label: 'Shape',
      note: 'F#4',
      type: 'generic'
    },
    {
      name: 'color',
      label: 'Color',
      note: 'G4',
      type: 'generic'
    },
    {
      name: 'audio_channel',
      label: 'Audio Chan.',
      note: 'G#4',
      type: 'generic'
    }
  ],
  parameters: [
    {
      name: 'time',
      label: 'Time',
      note: 'A4',
      min: 1,
      max: 127,
      initialValue: 6
    },
    {
      name: 'brightness',
      label: 'Brightness',
      note: 'A#4',
      min: 1,
      max: 127,
      initialValue: 6
    },
    {
      name: 'chunk_size',
      label: 'Chunk size',
      note: 'B4',
      min: 1,
      max: 127,
      initialValue: 6
    },
    {
      name: 'blur_value',
      label: 'Blur value',
      note: 'B#4',
      min: 1,
      max: 127,
      initialValue: 6
    }
  ]
};

class StripController extends React.Component {
  constructor(props) {
    super(props);
    let that = this;

    this.state = {
      midiOutput: null
    };
  }

  componentDidMount() {
    let that = this;

    navigator.requestMIDIAccess().then(midiAccess => {
      const outputs = midiAccess.outputs.values();
      for (const output of outputs) {
        if (output.name == this.props.name) {
          that.setState({
            midiOutput: output
          });
        }
      }
    });
  }

  handleChange(note, velocity = 127) {
    this.state.midiOutput.send([NOTE_ON, guessNoteNumber(note), velocity]);
    this.state.midiOutput.send([NOTE_OFF, guessNoteNumber(note), velocity]);
  }

  handleEffectChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    const { audios, active_state, strip } = this.props;

    let active_shape = strip.shapes[active_state.division_value].shape;
    let active_color_scheme =
      active_state.color_schemes[active_state.active_color_scheme_index];
    let is_reverse = active_state.is_reverse.toString();
    let is_mirror = active_state.is_mirror.toString();
    let time_interval = active_state.time_interval;
    let max_brightness = active_state.max_brightness;
    let chunk_size = active_state.chunk_size;
    let blur_value = active_state.blur_value;
    let active_audio_channel_name =
      audios[active_state.active_audio_channel_index].name;

    let colorSchemeElem = [];
    colorSchemeElem = active_color_scheme.map((color, index) => {
      return (
        <span
          key={'color' + index}
          ref={color + index}
          className="strip__color"
          style={{ backgroundColor: color }}
        ></span>
      );
    });

    return (
      <div className="strip-controller">
        {this.state.midiOutput ? (
          <div>
            <button
              className="button"
              onClick={() => {
                this.handleChange('G#4');
              }}
            >
              Audio {active_audio_channel_name}
            </button>

            <button
              className="button"
              onClick={() => {
                this.handleChange('G4');
              }}
            >
              Colors {colorSchemeElem}
            </button>

            <h5 className="strip-controller__title">Effects</h5>
            <div className="strip-controller-group">
              {keyConfiguration.effects.map(elem => {
                let isActiveClass = 'button ';
                isActiveClass +=
                  active_state.active_visualizer_effect === elem.name
                    ? 'active'
                    : ' ';

                isActiveClass += ' ' + elem.type;

                return (
                  <button
                    key={elem.name}
                    className={isActiveClass}
                    onClick={() => {
                      this.handleChange(elem.note);
                    }}
                  >
                    {elem.label}
                  </button>
                );
              })}
            </div>
            <h5 className="strip-controller__title">Modifiers</h5>
            <div className="strip-controller-group">
              <button
                className="button"
                style={{
                  background: active_state.is_reverse ? 'white' : 'transparent',
                  color: active_state.is_reverse ? 'black' : 'white'
                }}
                onClick={() => {
                  this.handleChange('E4');
                }}
              >
                Reverse
              </button>
              <button
                className="button"
                style={{
                  background: active_state.is_mirror ? 'white' : 'transparent',
                  color: active_state.is_mirror ? 'black' : 'white'
                }}
                onClick={() => {
                  this.handleChange('E#4');
                }}
              >
                Mirror
              </button>

              <button
                className="button"
                onClick={() => {
                  this.handleChange('F#4');
                }}
              >
                Divide
              </button>
            </div>
            <h5 className="strip-controller__title">Parameters</h5>
            <div className="strip-controller-group">
              <div>
                <div className="slider-holder">
                  <label htmlFor="time">
                    Time <span>{time_interval}</span>
                  </label>
                  <input
                    className="input"
                    onChange={e => {
                      this.handleChange('A4', e.target.value);
                    }}
                    type="range"
                    name="time"
                    min="1"
                    max="127"
                    value={time_interval}
                  />
                </div>
                <div className="slider-holder">
                  <label htmlFor="brightness">
                    Brightness <span>{max_brightness}</span>
                  </label>
                  <input
                    className="input"
                    onChange={e => {
                      this.handleChange('A#4', e.target.value);
                    }}
                    type="range"
                    name="brightness"
                    min="1"
                    max="127"
                    value={max_brightness}
                  />
                </div>
                <div className="slider-holder">
                  <label htmlFor="chunk_size">
                    Chunk Size <span>{chunk_size}</span>
                  </label>
                  <input
                    className="input"
                    onChange={e => {
                      this.handleChange('B4', e.target.value);
                    }}
                    type="range"
                    name="chunk_size"
                    min="1"
                    max="127"
                    value={chunk_size}
                  />
                </div>
                <div className="slider-holder">
                  <label htmlFor="blur_value">
                    Blur value <span>{blur_value}</span>
                  </label>
                  <input
                    className="input"
                    onChange={e => {
                      this.handleChange('B#4', e.target.value);
                    }}
                    type="range"
                    name="blur_value"
                    min="1"
                    max="127"
                    value={blur_value}
                  />
                </div>
                {/* 
            <div className="slider-holder">
              <label htmlFor="blur_value">
                Gain <span>{blur_value}</span>
              </label>
              <input
                className="input"
                onChange={e => {
                  this.handleChange('B#4', e.target.value);
                }}
                type="range"
                name="blur_value"
                min="1"
                max="127"
                value={blur_value}
              />
            </div> */}
              </div>
            </div>
          </div>
        ) : (
          'No midi channel associated'
        )}
      </div>
    );
  }
}

export default StripController;
