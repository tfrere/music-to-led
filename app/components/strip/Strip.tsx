import React from 'react';
import StripController from './StripController';
import PixelVisualizerCanvas from './PixelVisualizerCanvas';

class Strip extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {
      physical_shape,
      active_shape,
      pixels,
      name,
      audios,
      strip,
      active_state,
      config,
      framerate,
      active_audio_channel_name,
      is_strip_online,
      index
    } = this.props;

    const onlineClassNames = is_strip_online
      ? ' online-notifier--online'
      : ' online-notifier--offline';

    return (
      <div key={'strip' + index} className="strip card strip-block">
        <div className="card__header">
          <h4 className="card__header__title">{strip.name}</h4>
        </div>
        <div className={'online-notifier' + onlineClassNames}>
          {is_strip_online ? (
            <label className="online-notifier__label">
              {framerate}&nbsp; FPS
            </label>
          ) : (
            <label className="online-notifier__label">Offline</label>
          )}
          <div className="online-notifier__circle"></div>
        </div>
        <PixelVisualizerCanvas
          physical_shape={strip.physical_shape}
          active_shape={active_shape}
          pixels={pixels}
        />
        <StripController
          name={strip.midi_ports_for_changing_mode[0]}
          audios={audios}
          strip={strip}
          active_state={active_state}
          config={config}
          active_audio_channel_name={
            config.audio_ports[active_state.active_audio_channel_index].name
          }
        />
      </div>
    );
  }
}

export default Strip;
