import { Subscriber } from 'zeromq';
import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { promiseTimeout, zeromqMessages } from '../utils/zeromq';
import { compareObjects } from '../utils/compareObjects';

import Strip from './strip/Strip';
import StripController from './strip/StripController';
import ScenoVisualizer from './sceno/ScenoVisualizer';
import RgbVisualizerCanvas from './strip/RgbVisualizerCanvas';
import AudioVisualizerCanvas from './audio/AudioVisualizerCanvas';
import { gamma_table } from '../constants/gamma_table';

const applyGammaCorrection = pixels => {
  for (let i = 0; i < pixels[0].length; i++) {
    pixels[0][i] = gamma_table[pixels[0][i]];
    pixels[1][i] = gamma_table[pixels[1][i]];
    pixels[2][i] = gamma_table[pixels[2][i]];
  }
};

Object.compare = function(obj1, obj2) {
  //Loop through properties in object 1
  for (var p in obj1) {
    //Check property exists on both objects
    if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;

    switch (typeof obj1[p]) {
      //Deep compare objects
      case 'object':
        if (!Object.compare(obj1[p], obj2[p])) return false;
        break;
      //Compare function code
      case 'function':
        if (
          typeof obj2[p] == 'undefined' ||
          (p != 'compare' && obj1[p].toString() != obj2[p].toString())
        )
          return false;
        break;
      //Compare values
      default:
        if (obj1[p] != obj2[p]) return false;
    }
  }

  //Check object 2 for any extra properties
  for (var p in obj2) {
    if (typeof obj1[p] == 'undefined') return false;
  }
  return true;
};

let client_time = new Date().getTime();
let server_time = 0;
let object = null;

async function getZMQData() {
  const sock = new Subscriber();

  const topic = 'sendLiveDatas';

  sock.connect('tcp://127.0.0.1:8000');
  sock.subscribe(topic);
  console.log('Subscriber connected to port 8000');
  const quoteRegex = new RegExp("'", 'g');
  const trueRegex = new RegExp('True', 'g');
  const falseRegex = new RegExp('False', 'g');

  for await (const [buffer, msg] of sock) {
    const timestamp = new Date().getTime();

    const json_string = buffer
      .toString('utf8')
      .slice(topic.length + 1)
      .replace(quoteRegex, '"')
      .replace(trueRegex, '1')
      .replace(falseRegex, '0');
    object = JSON.parse(json_string);
    // console.log(object.pixels[0][0]);
    for (let i = 0; i < object.pixels.length; i++) {
      applyGammaCorrection(object.pixels[i]);
    }
    // console.log(object.pixels[0][0][0]);
    // console.log('connected');
    const current_server_timestamp = Math.round(object.time * 1000);

    server_time = timestamp;
  }
}

getZMQData();

class Builder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null,
      pixels: [],
      audios: [],
      active_states: [],
      are_strips_online: [],
      active_strip_index: 0,
      isZMQConnected: false
    };
  }
  componentDidMount() {
    let that = this;
    that._intervalId = setInterval(() => that.computeTime(), 50);
  }

  computeTime() {
    client_time = new Date().getTime();
    let is_connected = server_time - client_time;
    if (is_connected > -400) {
      this.setState({
        config: object.config,
        audios: object.audios,
        pixels: object.pixels,
        strips: object.strips,
        active_states: object.active_states,
        are_strips_online: object.are_strips_online,
        framerates: object.framerates,
        has_config_changed: !Object.compare(
          this.state.active_states,
          object.active_states
        ),
        isZMQConnected: true
      });
      // console.log(
      //   'hasConfigChanged',
      //   !Object.compare(this.state.active_states, object.active_states)
      // );
    } else {
      this.setState({
        isZMQConnected: false
      });
      console.log('disconnected');
    }
  }

  componentWillUnmount() {
    clearInterval(this._intervalId);
  }

  render() {
    let {
      are_strips_online,
      config,
      framerates,
      audios,
      pixels,
      strips,
      isZMQConnected
    } = this.state;

    let stripsElem = [];
    let audiosElem = [];
    let active_strip_data = null;
    let active_strip_index = this.state.active_strip_index;

    const isOkToLaunch =
      are_strips_online &&
      framerates &&
      framerates[0] != 0 &&
      config &&
      config._audio_ports &&
      config._audio_ports.length >= 1 &&
      strips &&
      audios &&
      framerates &&
      pixels &&
      pixels[0][2];

    if (isOkToLaunch) {
      stripsElem = strips.map((strip, index) => {
        const isActiveStrip = active_strip_index == index;

        const pixelsFrame = pixels[index];
        const is_strip_online = are_strips_online[index];
        const active_state = strip.active_state;
        const active_shape = strip._shapes[active_state.division_value];
        const framerate = framerates[index];

        if (isActiveStrip) {
          active_strip_data = {
            name: strip.midi_ports_for_changing_mode[0],
            audios: audios,
            strip: strip,
            is_strip_online: is_strip_online,
            framerate: framerate,
            active_state: active_state,
            config: config,
            active_audio_channel_name:
              config._audio_ports[active_state.active_audio_channel_index].name,
            strip_index: index
          };
        }
        return (
            <Strip
              key={"strip" + index}
              framerate={framerate}
              physical_shape={strip._physical_shape}
              active_shape={active_shape}
              pixels={pixelsFrame}
              name={strip.midi_ports_for_changing_mode[0]}
              audios={audios}
              strip={strip}
              active_state={active_state}
              config={config}
              is_strip_online={is_strip_online}
              active_audio_channel_name={
                config._audio_ports[active_state.active_audio_channel_index]
                  .name
              }
              index={index}
              className={
                isActiveStrip
                  ? 'left-panel__list__item left-panel__list__item--active'
                  : 'left-panel__list__item'
              }
              onClick={() => {
                this.setState({ active_strip_index: index });
              }}
            ></Strip>
        );
      });

      audiosElem = audios.map((audio, index) => {
        return (
          <div key={"audio" + index} className="left-panel__list__item">
            <div className="left-panel__list__item__header">
              <h4 className="left-panel__list__item__header__title">
                {config._audio_ports[index].name}
              </h4>
            </div>
            <div className="left-panel__list__item__content">
              <AudioVisualizerCanvas audio={audio} width={110} height={55} />
              {/* <div>
                <span>
                  {config._audio_ports[index].number_of_audio_samples}{' '}
                  <span>samples</span>
                </span>
                <span>
                  {config._audio_ports[index].min_frequency} <span>-</span>{' '}
                  {config._audio_ports[index].max_frequency} <span>hz</span>
                </span>
              </div> */}
            </div>
          </div>
        );
      });
    }

    return (
      <React.Fragment>
        {isZMQConnected && isOkToLaunch ? (
          <>
            <div className="left-panel">
              <h4 className="title">
                <i className="la la-microphone la-2x" />
                <span>{audios.length}</span> Audio
                {audios.length > 1 ? 's' : ''}
              </h4>
              <div className="left-panel__list left-panel__list--audio">
                {audiosElem}
              </div>
              <div className="left-panel__list left-panel__list--strip">
                <h4 className="title">
                  <i className="la la-lightbulb la-2x" />
                  <span>{stripsElem.length}</span> Strip
                  {stripsElem.length > 1 ? 's' : ''}
                </h4>
                {stripsElem}
              </div>
            </div>
            <div className="main-content">
              <ScenoVisualizer
                config={config}
                pixels={pixels}
                hasDarkMode={false}
                hasControls={true}
                hasGrid={false}
                activeStripIndex={active_strip_data.strip_index}
                hasActiveBoundingBoxVisible={true}
              />
              {active_strip_data ? (
                <div style={{ marginBottom: '20px' }}>
                  <div className="card">
                    {/* <h5 className="label" style={{ marginTop: '0px' }}>
                      RGB Visualizer
                    </h5> */}
                    <RgbVisualizerCanvas
                      pixels={pixels[active_strip_data.strip_index]}
                      physical_shape={active_strip_data.strip._physical_shape}
                      active_shape={
                        active_strip_data.strip._shapes[
                          active_strip_data.active_state.division_value
                        ]
                      }
                    />
                    <StripController active_strip_data={active_strip_data} />
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <div className="left-panel">
              <div className="screen-size flex-center-wrapper">
                <span className="loading"></span>
              </div>
            </div>
            <div className="screen-size flex-center-wrapper">
              <span className="loading"></span>
            </div>
          </>
        )}
      </React.Fragment>
    );
  }
}

export default Builder;
