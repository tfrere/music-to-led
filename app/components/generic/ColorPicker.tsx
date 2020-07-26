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
            <button className="button button--square button--has-type">
              <span className="button__type">{'G-1'}</span>
              <ColorScheme
                scheme={this.props.schemes[this.props.activeSchemeIndex]}
              />
            </button>
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
