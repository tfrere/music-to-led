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
import CircularSlider from '../generic/CircularSlider';
import InputRange from 'react-input-range';
import MidiVisualizer from '../midi/MidiVisualizer';
import StatesController from '../states/StatesController';

import AudioVisualizerCanvas from '../audio/AudioVisualizerCanvas';

import { keyConfiguration } from '../../constants/controller_effects';
import { types } from '../../constants/controller_effects_types';

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
    that.changeMidiChannel(this.props.active_strip_data.name);
  }

  componentWillUpdate(oldProps) {
    let that = this;
    if (
      this.props.active_strip_data.name != oldProps.active_strip_data.name ||
      window.midiOutputs != this.state.midiOutputs
    ) {
      window.setTimeout(() => {
        that.changeMidiChannel(that.props.active_strip_data.name);
      });
    }
  }

  changeMidiChannel = name => {
    let that = this;
    // console.log('to change', name);
    if (window.midiOutputs) {
      for (const output of window.midiOutputs) {
        // console.log('list', output.name);
        if (output.name === name) {
          that.setState({
            midiOutput: output,
            midiOutputs: window.midiOutputs
          });
          // console.log('changed', output.name);
        }
      }
    }
  };

  convertRangeAndSendNote = (note, value, range1, range2) => {
    this.sendNote(note, convertRange(value, range1, range2));
  };

  sendNote = (note, velocity = 127) => {
    const CHANGE_STATE = 27;
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
    this.props.active_strip_data.strip.states.map(elem => {
      if (name == elem.name) {
        response = true;
      }
    });
    return response;
  }

  render() {
    const { active_strip_data } = this.props;

    let active_audio_channel_name = active_strip_data.active_audio_channel_name;
    let active_state = active_strip_data.active_state;
    let active_visualizer_infos = keyConfiguration.effects.find(elem => {
      return active_state.active_visualizer_effect == elem.name;
    });
    let strip = active_strip_data.strip;
    let config = active_strip_data.config;
    let audios = active_strip_data.audios;

    let time_interval = active_state.time_interval;
    let max_brightness = active_state.max_brightness;
    let audio_samples_filter_min = active_state.audio_samples_filter_min;
    let audio_samples_filter_max = active_state.audio_samples_filter_max;
    let audio_gain = active_state.audio_gain;
    let audio_decay = active_state.audio_decay;
    let chunk_size = active_state.chunk_size;
    let blur_value = active_state.blur_value;
    let division_value = active_state.division_value;

    let buttonHolder = types.map((e, typeIndex) => {
      let buttonGroup = keyConfiguration.effects
        .filter(elem => {
          return elem.type == e;
        })
        .map((elem, index) => {
          let isActiveClass = 'strip-controller__button ';
          isActiveClass +=
            active_state.active_visualizer_effect === elem.name
              ? ' button--reverse'
              : ' ';

          isActiveClass += ' ' + elem.type;

          return (
            <Button
              alt={`${elem.label} ${guessNoteFromNumber(elem.note_int)}`}
              key={elem.name + index}
              className={isActiveClass + ' button--has-type'}
              onClick={() => {
                this.sendNote(elem.note_int);
              }}
            >
              <span className="button__type">{elem.type}</span>
              {elem.label}
            </Button> 
          );
        });
      return (
        <div key={"type" + typeIndex} className="button-group button-group--stretched">
          {buttonGroup}
        </div>
      );
    });
    const portalElem = document.getElementById(strip.name);
    return (
      <div className="strip-controller">
        {portalElem
          ? ReactDOM.createPortal(
              <StatesController
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
                <h5 className="label">Effects</h5>
                {buttonHolder}
              </div>
              <div className="strip-controller-group__item strip-controller-group__item--modifiers ">
                <h5 className="label">Modifiers</h5>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '35%' }}>
                    <ColorPicker
                      onChange={index => {
                        this.sendNote(20, index);
                      }}
                      activeSchemeIndex={active_state.active_color_scheme_index}
                      schemes={config.color_schemes}
                    />
                  </div>
                  {/* <div style={{ width: '25%' }}>
                    <Select
                      alt={guessNoteFromNumber(26)}
                      options={[
                        { name: 1, prefix: 'divide ' },
                        { name: 2, prefix: 'divide ' }
                      ]}
                      defaultValue={division_value + 1}
                      disabled={true}
                      setValue={value => {
                        this.convertRangeAndSendNote(
                          26,
                          value,
                          [1, 4],
                          [1, 127]
                        );
                      }}
                    />
                  </div> */}
                  <div style={{ width: '65%' }}>
                    <div className="button-group button-group--stretched">
                      <Button
                        alt={guessNoteFromNumber(17)}
                        className={
                          active_state.is_reverse
                            ? 'button--reverse button--has-type'
                            : 'button--has-type'
                        }
                        onClick={() => {
                          this.sendNote(17);
                        }}
                      >
                        Reverse
                      </Button>
                      <Button
                        alt={guessNoteFromNumber(18)}
                        className={
                          active_state.is_mirror
                            ? 'button--reverse button--has-type'
                            : 'button--has-type'
                        }
                        onClick={() => {
                          this.sendNote(18);
                        }}
                      >
                        Mirror
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="strip-controller-group__item">
                  <h5 className="label">Parameters</h5>
                  <div className="strip-controller__sub-card">
                    <div className="slider-holder">
                      <label htmlFor="time">
                        Speed <span>{time_interval}</span>
                      </label>
                      <input
                        className="input"
                        onChange={e => {
                          this.convertRangeAndSendNote(
                            22,
                            e.target.value,
                            [0, 500],
                            [1, 127]
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
                        Bright. <span>{max_brightness}</span>
                      </label>
                      <input
                        className="input"
                        onChange={e => {
                          this.sendNote(
                            23,
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

                    <div
                      className={
                        active_visualizer_infos.name == 'alternate_color_chunks'
                          ? 'slider-holder strip-controller__sub-card'
                          : 'slider-holder strip-controller__sub-card strip-controller__sub-card--disabled '
                      }
                    >
                      <label htmlFor="chunk_size">
                        Chunk <span>{chunk_size}</span>
                      </label>
                      <input
                        className="input"
                        onChange={e => {
                          this.sendNote(
                            24,
                            convertRange(e.target.value, [0, 20], [1, 127])
                          );
                        }}
                        type="range"
                        name="chunk_size"
                        min="0"
                        max="20"
                        value={chunk_size}
                      />
                    </div>
                    <div className="slider-holder">
                      <label htmlFor="blur_value">
                        Blur <span>{blur_value === 0.1 ? 0 : blur_value}</span>
                      </label>
                      <input
                        className="input"
                        onChange={e => {
                          this.sendNote(
                            25,
                            convertRange(
                              e.target.value,
                              [0.1, 18],
                              [1, 127],
                              true
                            )
                          );
                        }}
                        type="range"
                        name="blur_value"
                        min="0"
                        max="16"
                        step="0.1"
                        value={blur_value}
                      />
                      {/* <InputRange
                        minValue={0.1}
                        maxValue={18}
                        draggableTrack={false}
                        onChange={value => {
                          this.sendNote(
                            25,
                            convertRange(value, [0.1, 18], [1, 127], true)
                          );
                        }}
                        value={blur_value}
                      /> */}
                    </div>

                    {/* <CircularSlider
                      radius={140}
                      border={30}
                      value={blur_value}
                      range={[0.1, 8.0]}
                      round={1}
                      onChange={value => {
                        this.sendNote(
                          24,
                          convertRange(value, [1, 8], [1, 127], true)
                        );
                      }}
                    /> */}
                  </div>
                  {/* audio filters */}
                  <h5 className="label">Audio</h5>
                  <div
                    className={
                      active_visualizer_infos.type == 'audio'
                        ? 'strip-controller__audio-block strip-controller__sub-card'
                        : 'strip-controller__audio-block strip-controller__sub-card strip-controller__sub-card--disabled '
                    }
                  >
                    <div className="strip-controller__audio-block__audio-vizualiser">
                      <AudioVisualizerCanvas
                        name={
                          config._audio_ports[
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
                        width={125}
                        height={75}
                      />

                      {/* <InputRange
                        minValue={0}
                        maxValue={24}
                        draggableTrack={false}
                        onChange={value => {
                          this.sendNote(
                            28,
                            convertRange(value.min, [0, 24], [1, 25])
                          );

                          this.sendNote(
                            29,
                            convertRange(value.max, [0, 24], [1, 25])
                          );
                        }}
                        value={{
                          min: audio_samples_filter_min,
                          max: audio_samples_filter_max
                        }}
                      /> */}
                    </div>
                    <div className="strip-controller__audio-block__others">
                      <div>
                        <Select
                          alt={guessNoteFromNumber(21)}
                          options={this.props.active_strip_data.config._audio_ports.map(
                            elem => {
                              return { name: elem.name };
                            }
                          )}
                          defaultValue={active_audio_channel_name}
                          setValue={value => {
                            let stateIndex = -1;
                            this.props.active_strip_data.config._audio_ports.map(
                              (elem, index) => {
                                if (elem.name === value) {
                                  stateIndex = index;
                                }
                              }
                            );

                            this.sendNote(21, stateIndex);
                          }}
                        />
                      </div>
                      <div className="slider-holder">
                        <label htmlFor="audio_samples_filter_min">
                          min <span>{audio_samples_filter_min}</span>
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
                              29,
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
                          vol. <span>{audio_gain}</span>
                        </label>
                        <input
                          className="input"
                          onChange={e => {
                            this.sendNote(
                              30,
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
                </div>
              </div>
            </div>
            <hr />
            <MidiVisualizer
              midi_datas={strip._midi_logs}
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
