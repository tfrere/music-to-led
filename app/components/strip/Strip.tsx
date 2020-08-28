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
      index,
      className
    } = this.props;
    const onlineClassNames = is_strip_online
      ? ' online-notifier--online'
      : ' online-notifier--offline';

    const isReverse =
      (className && className.includes('left-panel__list__item--active')) ||
      false;
    let cardClassNames = isReverse ? 'left-panel__list__item--active ' : '';
    return (
      <div
        key={'left-panel__list__item' + index}
        className={cardClassNames + ' left-panel__list__item'}
        onClick={() => {
          if (this.props.onClick) {
            this.props.onClick();
          }
        }}
      >
        <div className="left-panel__list__item__header">
          <h4 className="left-panel__list__item__header__title">
            {strip.name}
          </h4>

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
        <h4 className="left-panel__list__item__header__sub-title">
          {strip.serial_port_name}
        </h4>
        <div className="strip-item__live-view">
          <PixelVisualizerCanvas
            physical_shape={strip._physical_shape}
            active_shape={active_shape}
            pixels={pixels}
          />
        </div>
        <div id={strip.name} />
      </div>
    );
  }
}

export default Strip;
