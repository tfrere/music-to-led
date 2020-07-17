import React from 'react';

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const META_TEXT = 0xff;

import convertRange from '../../utils/convertRange.js';
import Select from '../generic/Select';
import Button from '../generic/Button';
import ColorScheme from '../generic/ColorScheme';

import MidiVisualizer from '../midi/MidiVisualizer';
import StateController from '../strip/StateController';

import AudioVisualizerCanvas from '../audio/AudioVisualizerCanvas';

const types = ['audio', 'midi', 'time', 'generic'];

const keyConfiguration = {
  effects: [
    {
      name: 'scroll',
      label: 'Scroll',
      note: 'C3',
      note_int: 0,
      is_first: true,
      type: 'audio',
      has_gap: false
    },
    {
      name: 'energy',
      label: 'Energy',
      note: 'C#3',
      note_int: 1,
      is_first: false,
      type: 'audio',
      has_gap: false
    },
    {
      name: 'channel_flash',
      label: 'Flash',
      note: 'D3',
      note_int: 2,
      is_first: false,
      type: 'audio',
      has_gap: false
    },
    {
      name: 'channel_intensity',
      label: 'Intensity',
      note: 'D#3',
      note_int: 3,
      is_first: false,
      type: 'audio',
      has_gap: false
    },

    {
      name: 'spectrum',
      label: 'Spectrum',
      note: 'E3',
      note_int: 4,
      type: 'audio',
      is_first: false,
      has_gap: true
    },

    {
      name: 'piano_scroll',
      label: 'Midi Scroll',
      note: 'F3',
      note_int: 5,
      is_first: true,
      type: 'midi',
      has_gap: false
    },
    {
      name: 'piano_note',
      label: 'Midi note',
      note: 'F#3',
      note_int: 6,
      is_first: false,

      type: 'midi',
      has_gap: false
    },
    {
      name: 'pitchwheel_flash',
      label: 'Pitch. Flash',
      note: 'G3',
      note_int: 7,
      is_first: false,
      type: 'midi',
      has_gap: true
    },
    {
      name: 'alternate_color_chunks',
      label: 'Alt. Chunks',
      note: 'G#3',
      note_int: 8,
      is_first: true,

      type: 'time',
      has_gap: false
    },

    {
      name: 'alternate_color_shapes',
      label: 'Alt. Shapes',
      note: 'A3',
      note_int: 9,
      is_first: false,
      type: 'time',
      has_gap: false
    },
    {
      name: 'transition_color_shapes',
      label: 'Fade colors',
      note: 'A#3',
      note_int: 10,
      is_first: false,
      type: 'time',
      has_gap: true
    },
    {
      name: 'draw_line',
      label: 'Draw',
      note: 'B3',
      note_int: 11,
      is_first: true,
      type: 'generic',
      has_gap: false
    },

    {
      name: 'full_color',
      label: 'Full',
      note: 'B#3',
      note_int: 12,
      is_first: false,
      type: 'generic',
      has_gap: false
    },
    {
      name: 'fade_out',
      label: 'Fade to black',
      note: 'C#4',
      note_int: 13,
      is_first: false,

      type: 'generic',
      has_gap: false
    },
    {
      name: 'clear_frame',
      label: 'Clear',
      note: 'D4',
      note_int: 14,
      is_first: false,

      type: 'generic',
      has_gap: false
    },
    {
      name: 'fire',
      label: 'Fire',
      note: 'D#4',
      note_int: 15,
      is_first: false,

      type: 'generic',
      has_gap: false
    }
  ]
};

class StripController extends React.Component {
  constructor(props) {
    super(props);
    let that = this;

    this.state = {
      midiOutput: null,
      midiOutputs: [],
      isMidiAlreadyInitialized: false,
      isStatePristine: true
    };
  }

  componentDidMount() {
    let that = this;
    that.changeMidiChannel(that.props.name);
  }

  componentWillUpdate(oldProps) {
    let that = this;

    // console.log(oldProps);
    if (this.props.name != oldProps.name) {
      window.setTimeout(() => {
        that.changeMidiChannel(that.props.name);
      });
    }
  }

  changeMidiChannel = name => {
    let that = this;
    for (const output of window.outputs) {
      if (output.name === name) {
        that.setState({
          midiOutput: output
        });
      }
    }
  };

  sendNote = (note, velocity = 127) => {
    let CHANGE_STATE = 26;
    if (note != CHANGE_STATE && this.state.isStatePristine) {
      this.setState({ isStatePristine: false });
    } else if (note == CHANGE_STATE && !this.state.isStatePristine) {
      this.setState({ isStatePristine: true });
    }
    this.state.midiOutput.send(NOTE_ON, [note, velocity]);
    this.state.midiOutput.send(NOTE_OFF, [note, velocity]);
  };

  sendText = text => {
    var buf = Buffer.from(text).toJSON().data;
    this.state.midiOutput.sendSysex(0x00, buf);
    this.setState({ isStatePristine: true });
  };

  isAlreadyTakenStateName(name) {
    let response = false;
    this.props.config.states.map(elem => {
      if (name == elem.name) {
        response = true;
      }
    });
    return response;
  }

  render() {
    const {
      active_audio_channel_name,
      active_states,
      active_state,
      strip,
      is_strip_online,
      framerate,
      config,
      audios,
      strip_index
    } = this.props;

    let active_shape = strip.shapes[active_state.division_value].shape;
    let active_color_scheme =
      active_state.color_schemes[active_state.active_color_scheme_index];
    let is_reverse = active_state.is_reverse.toString();
    let is_mirror = active_state.is_mirror.toString();
    let time_interval = active_state.time_interval;
    let max_brightness = active_state.max_brightness;
    let audio_samples_filter_min = active_state.audio_samples_filter_min;
    let audio_samples_filter_max = active_state.audio_samples_filter_max;
    let audio_gain = active_state.audio_gain;
    let audio_decay = active_state.audio_decay;
    let chunk_size = active_state.chunk_size;
    let blur_value = active_state.blur_value;
    let division_value = active_state.division_value;

    let buttonHolder = types.map(e => {
      let buttonGroup = keyConfiguration.effects
        .filter(elem => {
          return elem.type == e;
        })
        .map(elem => {
          let isActiveClass = 'strip-controller__button ';
          isActiveClass +=
            active_state.active_visualizer_effect === elem.name
              ? ' button--reverse'
              : ' ';

          isActiveClass += ' ' + elem.type;

          return (
            <>
              <Button
                alt={elem.note}
                key={elem.name}
                className={isActiveClass + ' button--has-type'}
                onClick={() => {
                  this.sendNote(elem.note_int);
                }}
              >
                <span className="button__type">{elem.note}</span>
                {elem.label}
              </Button>
            </>
          );
        });
      return (
        <div className="button-group button-group--stretched">
          {buttonGroup}
        </div>
      );
    });

    return (
      <div className="strip-controller">
        {this.state.midiOutputs ? (
          <>
            <StateController
              isStatePristine={this.state.isStatePristine}
              sendText={this.sendText}
              sendNote={this.sendNote}
              config={config}
              active_state={active_state}
            />
            <hr />
            <div className="strip-controller-group">
              <div className="strip-controller-group__item strip-controller-group__item--effect">
                {buttonHolder}
              </div>
              <div className="strip-controller-group__item">
                <div className="button-group button-group--stretched">
                  <Button
                    className="button"
                    onClick={() => {
                      this.sendNote(19);
                    }}
                  >
                    <>
                      Color <ColorScheme scheme={active_color_scheme} />
                    </>
                  </Button>
                  <Button
                    className={active_state.is_reverse ? 'button--reverse' : ''}
                    onClick={() => {
                      this.sendNote(16);
                    }}
                  >
                    Reverse
                  </Button>

                  <Button
                    className={active_state.is_mirror ? 'button--reverse' : ''}
                    onClick={() => {
                      this.sendNote(17);
                    }}
                  >
                    Mirror
                  </Button>

                  <Button
                    className="button"
                    onClick={() => {
                      this.sendNote(25);
                    }}
                  >
                    Divide {division_value}
                  </Button>
                </div>
                <div className="strip-controller-group__item">
                  <h5 className="strip-controller__title">Parameters</h5>
                  <div className="card strip-controller__audio">
                    <div className="slider-holder">
                      <label htmlFor="time">
                        Time <span>{time_interval}</span>
                      </label>
                      <input
                        className="input"
                        onChange={e => {
                          this.sendNote(
                            21,
                            convertRange(e.target.value, [0, 500], [1, 127])
                          );
                        }}
                        type="range"
                        name="time"
                        min="0"
                        max="500"
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
                          this.sendNote(
                            22,
                            convertRange(e.target.value, [0, 255], [1, 127])
                          );
                        }}
                        type="range"
                        name="brightness"
                        min="0"
                        max="255"
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
                          this.sendNote(
                            23,
                            convertRange(e.target.value, [0, 50], [1, 127])
                          );
                        }}
                        type="range"
                        name="chunk_size"
                        min="0"
                        max="50"
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
                          this.sendNote(
                            24,
                            convertRange(
                              e.target.value,
                              [0.1, 8],
                              [1, 127],
                              (rouded = True)
                            )
                          );
                        }}
                        type="range"
                        name="blur_value"
                        min="0"
                        max="8"
                        step="0.1"
                        value={blur_value}
                      />
                    </div>
                  </div>
                  {/* audio filters */}
                  <h5 className="strip-controller__title">Audio</h5>
                  <div className="card strip-controller__audio">
                    <Select
                      options={this.props.config.audio_ports.map(elem => {
                        return { name: elem.name };
                      })}
                      defaultValue={active_audio_channel_name}
                      setValue={value => {
                        let stateIndex = -1;
                        this.props.config.audio_ports.map((elem, index) => {
                          if (elem.name === value) {
                            stateIndex = index;
                          }
                        });

                        this.sendNote(20, stateIndex);
                      }}
                    />

                    <AudioVisualizerCanvas
                      name={
                        config.audio_ports[
                          active_state.active_audio_channel_index
                        ].name
                      }
                      audio={audios[active_state.active_audio_channel_index]}
                      audio_samples_filter_min={
                        active_state.audio_samples_filter_min
                      }
                      audio_samples_filter_max={
                        active_state.audio_samples_filter_max
                      }
                      audio_gain={active_state.audio_gain}
                      width={75}
                      height={30}
                    />
                    <div className="slider-holder">
                      <label htmlFor="audio_samples_filter_min">
                        min <span>{audio_samples_filter_min}</span>
                      </label>
                      <input
                        className="input"
                        onChange={e => {
                          this.sendNote(
                            27,
                            convertRange(e.target.value, [0, 24], [1, 25])
                          );
                        }}
                        type="range"
                        name="audio_samples_filter_min"
                        min="0"
                        max="24"
                        value={audio_samples_filter_min}
                      />
                    </div>

                    <div className="slider-holder">
                      <label htmlFor="audio_samples_filter_max">
                        max <span>{audio_samples_filter_max}</span>
                      </label>
                      <input
                        className="input"
                        onChange={e => {
                          this.sendNote(
                            28,
                            convertRange(e.target.value, [0, 24], [1, 25])
                          );
                        }}
                        type="range"
                        name="audio_samples_filter_max"
                        min="0"
                        max="24"
                        value={audio_samples_filter_max}
                      />
                    </div>

                    <div className="slider-holder">
                      <label htmlFor="audio_gain">
                        gain <span>{audio_gain}</span>
                      </label>
                      <input
                        className="input"
                        onChange={e => {
                          this.sendNote(
                            29,
                            convertRange(e.target.value, [0.0, 1.0], [1, 127])
                          );
                        }}
                        type="range"
                        name="audio_gain"
                        min="0"
                        max="1"
                        step="0.1"
                        value={audio_gain}
                      />
                    </div>
                  </div>
                  {/* <div className="slider-holder">
                        <label htmlFor="audio_decay">
                          audio decay <span>{audio_decay}</span>
                        </label>
                        <input
                          className="input"
                          onChange={e => {
                            this.sendNote(
                              30,
                              convertRange(e.target.value, [0.00001, 0.1], [1, 127])
                            );
                          }}
                          type="range"
                          name="audio_decay"
                          min="0"
                          max="1"
                          step="0.1"
                          value={audio_decay}
                        />
                      </div> */}
                </div>
              </div>
            </div>
            <hr />
            <MidiVisualizer
              midi_datas={strip.midi_logs}
              channels={strip.midi_ports_for_changing_mode}
            />
          </>
        ) : (
          <div className="screen-size flex-center-wrapper">
            <span className="loading"></span>
          </div>
        )}
      </div>
    );
  }
}

export default StripController;
