import React from 'react';

class StripVisualizer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let pixelsElems = [];
    let shape_offsets = [];
    let real_shape_offsets = [];

    if (this.props.active_shape) {
      this.props.active_shape.map((strip, index) => {
        if (index - 1 >= 0) {
          shape_offsets.push(strip + shape_offsets[index - 1]);
        } else {
          shape_offsets.push(strip);
        }
      });
    }

    if (this.props.pixels) {
      let gapIndex = 0;
      pixelsElems = this.props.pixels[0].map((pixel, index) => {
        let classes = 'pixels__elem';
        shape_offsets.map(offset => {
          if (index == offset) {
            classes = 'pixels__elem pixels__elem--space';
            gapIndex++;
          }
        });

        return (
          <div
            key={this.props.name + index}
            className={classes}
            style={{
              backgroundColor:
                'rgb(' +
                this.props.pixels[0][index] +
                ',' +
                this.props.pixels[1][index] +
                ', ' +
                this.props.pixels[2][index] +
                ')'
            }}
          ></div>
        );
      });
    }

    return <div className="pixels">{pixelsElems}</div>;
  }
}

export default StripVisualizer;
