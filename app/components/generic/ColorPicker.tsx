import React from 'react';

import Button from './Button';
import ColorScheme from './ColorScheme';
import PopOver from './PopOver';

import guessNoteFromNumber from '../../utils/guessNoteFromNumber.js';

class ColorPicker extends React.Component {
  state = {
    isOpen: false
  };
  render(props) {
    const schemesToRender = this.props.schemes.map((elem, index) => {
      return (
        <Button
          key={elem + index}
          onClick={() => {
            this.props.onChange(index);
          }}
          className={
            this.props.activeSchemeIndex === index
              ? 'button--square button--reverse'
              : 'button--square'
          }
        >
          <ColorScheme index={index} scheme={elem} />
        </Button>
      );
    });

    return (
      <div className="color-picker">
        <PopOver
          showArrow
          triggerNode={
            <Button
              alt="G-1"
              className="button button--square button--has-type"
            >
              <ColorScheme
                scheme={this.props.schemes[this.props.activeSchemeIndex]}
              />
            </Button>
          }
          trigger="click"
        >
          {schemesToRender}
        </PopOver>
      </div>
    );
  }
}

export default ColorPicker;
