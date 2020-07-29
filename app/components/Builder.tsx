import { Subscriber } from 'zeromq';
import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { promiseTimeout, zeromqMessages } from '../utils/zeromq';

import Strip from './strip/Strip';
import StripController from './strip/StripController';
import ScenoVisualizerCanvas from './sceno/ScenoVisualizerCanvas';
import AudioVisualizerCanvas from './audio/AudioVisualizerCanvas';

let client_time = new Date().getTime();
let server_time = 0;
let object = null;

async function getZMQData() {
  const sock = new Subscriber();

  const topic = 'sendInfos';

  sock.connect('tcp://127.0.0.1:8000');
  sock.subscribe(topic);
  console.log('Subscriber connected to port 8000');
  var re = new RegExp("'", 'g');
  var re2 = new RegExp('True', 'g');
  var re3 = new RegExp('False', 'g');

  for await (const [buffer, msg] of sock) {
    const timestamp = new Date().getTime();

    const json_string = buffer
      .toString('utf8')
      .slice(topic.length + 1)
      .replace(re, '"')
      .replace(re2, '1')
      .replace(re3, '0');
    object = JSON.parse(json_string);
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
    if (is_connected > -200) {
      this.setState({
        config: object.config,
        audios: object.audios,
        pixels: object.pixels,
        strips: object.strips,
        active_states: object.active_states,
        are_strips_online: object.are_strips_online,
        framerates: object.framerates,
        isZMQConnected: true
      });
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
      active_states,
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
      active_states &&
      active_states[0] &&
      are_strips_online &&
      framerates &&
      framerates[0] != 0 &&
      config &&
      config._audio_ports &&
      config._audio_ports.length >= 1 &&
      strips &&
      active_states.length === strips.length &&
      audios &&
      framerates &&
      pixels &&
      pixels[0][2];

    if (isOkToLaunch) {
      stripsElem = strips.map((strip, index) => {
        const isActiveStrip = active_strip_index == index;

        const pixelsFrame = pixels[index];
        const is_strip_online = are_strips_online[index];
        const active_state = active_states[index];
        // console.log('strip', strip);
        // console.log('active_states', active_states);
        // console.log('active_state', active_state);
        const active_shape = strip._shapes[active_state.division_value];
        const framerate = framerates[index];
        const onlineClassNames = is_strip_online
          ? ' online-notifier--online'
          : ' online-notifier--offline';

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
          <>
            <Strip
              key={strip + index}
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
          </>
        );
      });

      audiosElem = audios.map((audio, index) => {
        return (
          <div className={'left-panel__list__item'}>
            <AudioVisualizerCanvas audio={audio} width={120} height={60} />
            <div>
              <h4>{config._audio_ports[index].name}</h4>
              <span>
                {config._audio_ports[index].number_of_audio_samples} samples
              </span>
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
              <div className="left-panel__list left-panel__list--audio">
                <h4 className="title">
                  <i className="la la-microphone la-2x" />
                  <span>{audios.length}</span> Audio
                  {audios.length > 1 ? 's' : ''}
                </h4>
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
            <div style={{ height: '310px' }}>
              <ScenoVisualizerCanvas
                config={config}
                pixels={pixels}
                height={280}
                hasDarkMode={false}
                hasGrid={false}
                activeStripIndex={active_strip_data.strip_index}
                hasActiveBoundingBoxVisible={true}
              />
            </div>{' '}
            {active_strip_data ? (
              <div>
                {/* active_states, is_strip_online, framerate, strip_index, */}
                <div className="card">
                  <StripController active_strip_data={active_strip_data} />
                </div>
              </div>
            ) : null}
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
