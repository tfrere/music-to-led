import React from 'react';
import StripController from './StripController';
import PixelVisualizerCanvas from './PixelVisualizerCanvas';
import { Collapse } from 'react-collapse';

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
      index,
      className
    } = this.props;
    const onlineClassNames = is_strip_online
      ? ' online-notifier--online'
      : ' online-notifier--offline';

    const isReverse = className.includes('card--reverse');
    let cardClassNames = isReverse ? 'card--without-border' : '';
    cardClassNames += 'card--without-border';

    return (
      <div
        key={'strip' + index}
        className={cardClassNames + ' strip card'}
        style={{ height: '68px' }}
        onClick={() => {
          if (this.props.onClick) {
            this.props.onClick();
          }
        }}
      >
        <div className="strip__header">
          <label className="strip__header__title">
            {strip.name}
            <span> on </span>
            {active_state.name}
          </label>
          <div className={'online-notifier' + onlineClassNames}>
            {is_strip_online ? (
              <label className="online-notifier__label">
                {framerate}&nbsp; FPS &nbsp;
              </label>
            ) : (
              <label className="online-notifier__label">Offline&nbsp;</label>
            )}
            <div className="online-notifier__circle"></div>
          </div>
        </div>
        <hr />
        <div className="strip__live-view">
          <PixelVisualizerCanvas
            physical_shape={strip.physical_shape}
            active_shape={active_shape}
            pixels={pixels}
          />
        </div>
      </div>
    );
  }
}

export default Strip;
