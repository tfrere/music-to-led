import React from 'react';

class ColorScheme extends React.Component {
  render(props) {
    console.log(this.props.scheme);
    let colorSchemeElem = [];
    if (this.props.scheme) {
      colorSchemeElem = this.props.scheme.map((color, index) => {
        return (
          <span
            key={'color' + index}
            className="strip__color"
            style={{ backgroundColor: color }}
          ></span>
        );
      });
    }

    return <div>{colorSchemeElem}</div>;
  }
}

export default ColorScheme;
