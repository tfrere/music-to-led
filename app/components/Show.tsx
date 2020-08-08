import { Subscriber } from 'zeromq';
import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { promiseTimeout, zeromqMessages } from '../utils/zeromq';

import Strip from './strip/Strip';
import StripController from './strip/StripController';
import ScenoVisualizerCanvas from './sceno/ScenoVisualizerCanvas';

let client_time = new Date().getTime();
let server_time = 0;
let object = null;

async function getZMQData() {
  const sock = new Subscriber();

  const topic = 'sendLiveDatas';

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
    const current_server_timestamp = Math.round(object.time * 1000);

    server_time = timestamp;
  }
}
getZMQData();

class Show extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null,
      pixels: [],
      audios: [],
      active_states: [],
      are_strips_online: [],
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
        strips: object._strips,
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
    let active_strip_data = null;

    if (
      active_states &&
      active_states[0] &&
      are_strips_online &&
      config &&
      strips &&
      framerates &&
      audios &&
      framerates &&
      pixels &&
      pixels[0][2]
    ) {
      stripsElem = strips.map((strip, index) => {
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

        return (
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
              config._audio_ports[active_state.active_audio_channel_index].name
            }
            index={index}
          ></Strip>
        );
      });
    }
    return (
      <React.Fragment>
        {isZMQConnected ? (
          <div className="screen-size flex-center-wrapper">
            <div style={{ width: '100%', height: '500px' }}>
              <ScenoVisualizerCanvas
                config={config}
                pixels={pixels}
                height={490}
                hasDarkMode={true}
                hasGrid={false}
              />
            </div>
            {/* <div>
              <h4 className="title">
                <i className="la la-lightbulb la-2x" />
                <span>{stripsElem.length}</span> Strip
                {stripsElem.length > 1 ? 's' : ''}
              </h4>
              {stripsElem}
            </div> */}
          </div>
        ) : (
          <div className="screen-size flex-center-wrapper">
            <span className="loading"></span>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default Show;
