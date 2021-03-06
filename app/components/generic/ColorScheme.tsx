import React from 'react';

class ColorScheme extends React.Component {
  render(props) {
    let colorSchemeElem = [];
    if (this.props.scheme) {
      colorSchemeElem = this.props.scheme.map((color, index) => {
        return (
          <span
            key={'color' + index}
            className="color-scheme__color"
            style={{ backgroundColor: color }}
          ></span>
        );
      });
    }

    return <span className="color-scheme">{colorSchemeElem}</span>;
  }
}

export default ColorScheme;
