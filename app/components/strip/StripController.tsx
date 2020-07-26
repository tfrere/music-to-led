import React from 'react';
import ReactDOM from 'react-dom';

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const META_TEXT = 0xff;

import convertRange from '../../utils/convertRange.js';
import guessNoteFromNumber from '../../utils/guessNoteFromNumber.js';
import Select from '../generic/Select';
import Button from '../generic/Button';
import ColorScheme from '../generic/ColorScheme';
import ColorPicker from '../generic/ColorPicker';

import MidiVisualizer from '../midi/MidiVisualizer';
import StateController from '../strip/StateController';

import AudioVisualizerCanvas from '../audio/AudioVisualizerCanvas';

const types = ['audio', 'midi', 'time', 'generic'];

const keyConfiguration = {
  effects: [
    {
      name: 'scroll',
      label: 'Scroll',
      note: 'C2',
      note_int: 0,
      is_first: true,
      type: 'audio',
      has_gap: false
    },
    {
      name: 'energy',
      label: 'Energy',
      note: 'C#2',
      note_int: 1,
      is_first: false,
      type: 'audio',
      has_gap: false
    },
    {
      name: 'channel_flash',
      label: 'Flash',
      note: 'D2',
      note_int: 2,
      is_first: false,
      type: 'audio',
      has_gap: false
    },
    {
      name: 'channel_intensity',
      label: 'Intensity',
      note: 'D#2',
      note_int: 3,
      is_first: false,
      type: 'audio',
      has_gap: false
    },

    {
      name: 'spectrum',
      label: 'Spectrum',
      note: 'E2',
      note_int: 4,
      type: 'audio',
      is_first: false,
      has_gap: true
    },

    {
      name: 'piano_scroll',
      label: 'Midi Scroll',
      note: 'F2',
      note_int: 5,
      is_first: true,
      type: 'midi',
      has_gap: false
    },
    {
      name: 'piano_note',
      label: 'Midi note',
      note: 'F#2',
      note_int: 6,
      is_first: false,

      type: 'midi',
      has_gap: false
    },
    {
      name: 'pitchwheel_flash',
      label: 'Pitch. Flash',
      note: 'G2',
      note_int: 7,
      is_first: false,
      type: 'midi',
      has_gap: true
    },
    {
      name: 'alternate_color_chunks',
      label: 'Alt. Chunks',
      note: 'G#2',
      note_int: 8,
      is_first: true,

      type: 'time',
      has_gap: false
    },

    {
      name: 'alternate_color_shapes',
      label: 'Alt. Shapes',
      note: 'A2',
      note_int: 9,
      is_first: false,
      type: 'time',
      has_gap: false
    },
    {
      name: 'transition_color_shapes',
      label: 'Fade colors',
      note: 'A#2',
      note_int: 10,
      is_first: false,
      type: 'time',
      has_gap: true
    },
    {
      name: 'draw_line',
      label: 'Draw',
      note: 'B2',
      note_int: 11,
      is_first: true,
      type: 'generic',
      has_gap: false
    },

    {
      name: 'full_color',
      label: 'Full',
      note: 'C1',
      note_int: 12,
      is_first: false,
      type: 'generic',
      has_gap: false
    },
    {
      name: 'fade_out',
      label: 'Fade to black',
      note: 'C#1',
      note_int: 13,
      is_first: false,

      type: 'generic',
      has_gap: false
    },
    {
      name: 'clear_frame',
      label: 'Clear',
      note: 'D1',
      note_int: 14,
      is_first: false,

      type: 'generic',
      has_gap: false
    },
    {
      name: 'fire',
      label: 'Fire',
      note: 'D#1',
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
    if (
      this.props.name != oldProps.name ||
      window.midiOutputs != this.state.midiOutputs
    ) {
      window.setTimeout(() => {
        that.changeMidiChannel(that.props.name);
      });
    }
  }

  changeMidiChannel = name => {
    let that = this;
    if (window.midiOutputs) {
      for (const output of window.midiOutputs) {
        if (output.name === name) {
          that.setState({
            midiOutput: output,
            midiOutputs: window.midiOutputs
          });
          console.log(output);
        }
      }
    }
  };

  sendNote = (note, velocity = 127) => {
    const CHANGE_STATE = 26;
    if (note != CHANGE_STATE && this.state.isStatePristine) {
      this.setState({ isStatePristine: false });
    } else if (note == CHANGE_STATE && !this.state.isStatePristine) {
      this.setState({ isStatePristine: true });
    }
    this.state.midiOutput.send(NOTE_ON, [note, velocity]);
    this.state.midiOutput.send(NOTE_OFF, [note, velocity]);
  };

  sendText = text => {
    let buf = Buffer.from(text).toJSON().data;
    this.state.midiOutput.sendSysex(0x00, buf);
    this.setState({ isStatePristine: true });
  };

  isAlreadyTakenStateName(name) {
    let response = false;
    this.props.strip.states.map(elem => {
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
    const portalElem = document.getElementById(strip.name);
    return (
      <div className="strip-controller">
        {portalElem
          ? ReactDOM.createPortal(
              <StateController
                isStatePristine={this.state.isStatePristine}
                sendText={this.sendText}
                strip={strip}
                sendNote={this.sendNote}
                config={config}
                active_state={active_state}
              />,
              portalElem
            )
          : null}
        {this.state.midiOutput ? (
          <>
            <div className="strip-controller-group">
              <div className="strip-controller-group__item strip-controller-group__item--effect">
                {buttonHolder}
              </div>
              <div className="strip-controller-group__item strip-controller-group__item--modifiers ">
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '25%' }}>
                    <ColorPicker
                      onChange={index => {
                        this.sendNote(19, index);
                      }}
                      activeSchemeIndex={active_state.active_color_scheme_index}
                      schemes={active_state.color_schemes}
                    />
                  </div>
                  <div style={{ width: '25%' }}>
                    <Select
                      options={[
                        { name: 1, prefix: 'C#-0 divide ' },
                        { name: 2, prefix: 'C#-0 divide ' },
                        { name: 3, prefix: 'C#-0 divide ' }
                      ]}
                      defaultValue={division_value + 1}
                      setValue={value => {
                        this.sendNote(
                          25,
                          convertRange(value, [1, 4], [1, 127])
                        );
                      }}
                    />
                  </div>
                  <div style={{ width: '50%' }}>
                    <div className="button-group button-group--stretched">
                      <Button
                        className={
                          active_state.is_reverse
                            ? 'button--reverse button--has-type'
                            : 'button--has-type'
                        }
                        onClick={() => {
                          this.sendNote(16);
                        }}
                      >
                        <span className="button__type">{'E-1'}</span>
                        Reverse
                      </Button>
                      <Button
                        className={
                          active_state.is_mirror
                            ? 'button--reverse button--has-type'
                            : 'button--has-type'
                        }
                        onClick={() => {
                          this.sendNote(17);
                        }}
                      >
                        <span className="button__type">{'F-1'}</span>
                        Mirror
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="strip-controller-group__item">
                  <h5 className="strip-controller__title">Parameters</h5>
                  <div className="strip-controller__sub-card">
                    <div className="slider-holder">
                      <label htmlFor="time">
                        Speed <span>{time_interval}</span> A-1
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
                        Brightness <span>{max_brightness}</span> A#-1
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
                        Chunk Size <span>{chunk_size}</span> B-1
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
                        Blur value <span>{blur_value}</span> C-0
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
                              true
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
                  <div className="strip-controller__audio-block strip-controller__sub-card">
                    <div>
                      <AudioVisualizerCanvas
                        name={
                          config.audio_ports[
                            active_state.active_audio_channel_index
                          ].name
                        }
                        hasModifiers={true}
                        audio={audios[active_state.active_audio_channel_index]}
                        gain={active_state.audio_gain}
                        audio_samples_filter_min={
                          active_state.audio_samples_filter_min
                        }
                        audio_samples_filter_max={
                          active_state.audio_samples_filter_max
                        }
                        audio_gain={active_state.audio_gain}
                        width={120}
                        height={60}
                      />
                    </div>
                    <div>
                      <div>
                        <span>G#-1</span>
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
                      </div>
                      <div className="slider-holder">
                        <label htmlFor="audio_samples_filter_min">
                          min <span>{audio_samples_filter_min}</span> D#-0
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
                          max <span>{audio_samples_filter_max}</span> E-0
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
                          gain <span>{audio_gain}</span> F-0
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
