import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { promiseTimeout, zeromqMessages } from '../utils/zeromq';

import AudioVisualizer from './audio/AudioVisualizer';
import AudioVisualizerCanvas from './audio/AudioVisualizerCanvas';
import StripController from './strip/StripController';
import PixelVisualizerCanvas from './strip/PixelVisualizerCanvas';

class Builder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null,
      strips: [],
      audios: [],
      midi: [],
      active_states: [],
      are_strips_online: [],
      isZMQConnected: false,
      timeSinceLastConnection: 0
    };
  }
  componentDidMount() {
    let that = this;
    that._intervalId = setInterval(() => that.getZMQData(), 50);
  }

  componentWillUnmount() {
    clearInterval(this._intervalId);
  }

  getZMQData() {
    let that = this;

    let res = zeromqMessages({ type: 'getInfos' });
    console.log('request');
    that.setState({
      timeSinceLastConnection: this.state.timeSinceLastConnection + 1
    });
    res
      .then(data => {
        console.log('succes');
        // console.log(data);
        that.setState({
          config: data.config,
          audios: data.audios,
          strips: data.strips,
          active_states: data.active_states,
          are_strips_online: data.are_strips_online,
          framerates: data.framerates,
          isZMQConnected: true,
          timeSinceLastConnection: 0
        });
        return data;
      })
      .catch(data => {
        console.log('error');
      });
  }

  render() {
    let {
      active_states,
      are_strips_online,
      config,
      framerates,
      audios,
      strips,
      isZMQConnected,
      timeSinceLastConnection
    } = this.state;

    let audiosElem = [];
    let stripsElem = [];

    if (timeSinceLastConnection > 10) {
      isZMQConnected = false;
    }

    if (
      active_states &&
      are_strips_online &&
      config &&
      framerates &&
      audios &&
      framerates &&
      strips
    ) {
      audiosElem = audios.map((audio, index) => {
        return (
          <AudioVisualizerCanvas
            key={'audio' + index}
            name={config.audio_ports[index].name}
            audio={audios[index]}
          />
        );
      });

      // stripsElem = config.strips.map((strip, index) => {
      //   const pixels = strips[index];
      //   const is_strip_online = are_strips_online[index];
      //   const active_state = active_states[strip.active_state_index];
      //   console.log(active_state.division_value);
      //   const active_shape = strip.shapes[active_state.division_value];
      //   const framerate = framerates[index];
      //   const onlineClassNames = is_strip_online
      //     ? ' online-notifier--online'
      //     : ' online-notifier--offline';

      //   // console.log('isonline', is_strip_online);
      //   // console.log('strip', strip);
      //   // console.log('active_state', active_state);
      //   // console.log('active_shape', active_shape);
      //   // console.log('framerate', framerate);
      //   // console.log('audio', audio);
      //   // console.log('pixels', pixels);

      //   return (
      //     <div key={'strip' + index} className="strip card strip-block">
      //       <div className="card__header">
      //         <h4 className="card__header__title">{strip.name}</h4>
      //       </div>

      //       <div className={'online-notifier' + onlineClassNames}>
      //         {!is_strip_online ? (
      //           <label className="online-notifier__label">
      //             {framerate}&nbsp; FPS
      //           </label>
      //         ) : (
      //           <label className="online-notifier__label">Offline</label>
      //         )}
      //         <div className="online-notifier__circle"></div>
      //       </div>

      //       <PixelVisualizerCanvas
      //         name={strip.name}
      //         physical_shape={strip.physical_shape.shape}
      //         active_shape={active_shape}
      //         pixels={pixels}
      //       />
      //       <StripController
      //         name={strip.midi_ports_for_changing_mode[0]}
      //         audios={audios}
      //         strip={strip}
      //         active_state={active_state}
      //       />
      //     </div>
      //   );
      // });
    }

    return (
      <React.Fragment>
        {isZMQConnected ? (
          <div>
            <div>
              <h4 className="title">
                <i className="la la-microphone la-2x" />
                <span>{audiosElem.length}</span> Audio channel
                {audiosElem.length > 1 ? 's' : ''}{' '}
              </h4>
              {audiosElem}
            </div>
            <h4 className="title">
              <i className="la la-lightbulb la-2x" />
              <span>{stripsElem.length}</span> Strip
              {stripsElem.length > 1 ? 's' : ''}
            </h4>
            {stripsElem}
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

export default Builder;
